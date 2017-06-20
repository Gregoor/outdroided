import {addDays, differenceInDays, distanceInWords} from 'date-fns';
import Head from 'next/head'
import React from 'react';
import GithubCorner from 'react-github-corner';

import db from '../data';

function daysInWords(days) {
  const now = new Date();
  return distanceInWords(addDays(now, days), now);
}

function avgObjectValues(obj) {
  const values = Object.values(obj);
  return values.reduce((n1, n2) => n1 + n2, 0) / values.length;
}

const PAGE_TITLE = 'Android Update Support by Maintainer';

const MOST_RECENT_VERSION = db.release[db.release.length - 1].version;

const VERSION_COLORS = {
  MINOR_BEHIND: '#FDD835',
  MAJOR_BEHIND: '#FF5722',
  CURRENT: '#8BC34A'
};

const BORDER_COLOR = '#eceeef';

const TABLE_CELL_STYLE = {borderTop: `1px solid ${BORDER_COLOR}`, padding: '.75rem'};

function Th({children, style, ...props}) {
  return (
    <th style={{...style, ...TABLE_CELL_STYLE, borderBottom: `2px solid ${BORDER_COLOR}`}} {...props}>
      {children}
    </th>
  );
}

function InfoHead({children, ...props}) {
  return (
    <Th {...props} style={{textAlign: 'right'}}>
      <span style={{borderBottom: '1px dotted black'}}>{children}</span>
    </Th>
  );
}

function LifetimeHead(props) {
  return (
    <InfoHead
      title="Time during which the device has gotten updates"
      {...props}
    />
  );
}

function OutdatedHead(props) {
  return (
    <InfoHead
      title="Time it took during lifetime to get updates"
      {...props}
    />
  );
}

function Cell({children, style, ...props}) {
  return <td style={{...style, ...TABLE_CELL_STYLE}} {...props}>{children}</td>
}

function CellRight({children, ...props}) {
  return <Cell {...props} style={{textAlign: 'right'}}>{children}</Cell>
}

function DeviceRow({children}) {
  return <tr style={{backgroundColor: '#f9f9f9'}}>{children}</tr>
}

function isCurrentMajor(version) {
  return version[0] === MOST_RECENT_VERSION[0];
}

class Maintainer extends React.Component {

  state = {
    showDevices: true
  };

  handleClick = () => this.setState(({showDevices}) => ({showDevices: !showDevices}));

  render() {
    const {name, devices} = this.props;

    const daysAlive = {};
    for (const {codename, updates} of devices) {
      const lastUpdate = updates[updates.length - 1];
      if (isCurrentMajor(lastUpdate.release.version)) {
        delete daysAlive[codename];
      } else {
        daysAlive[codename] = differenceInDays(lastUpdate.releasedAt, updates[0].releasedAt);
      }
    }
    const avgDaysAlive = avgObjectValues(daysAlive);

    const daysOutdated = {};
    for (const {codename, updates} of devices) {
      let total = 0;
      for (const update of updates) {
        total += Math.max(0, differenceInDays(update.releasedAt, update.release.releasedAt));
      }
      daysOutdated[codename] = total;
    }
    const avgDaysOutdated = avgObjectValues(daysOutdated);

    return (
      <tbody>
        <tr onClick={this.handleClick} style={{cursor: 'pointer'}}>
          <Cell colSpan="2">{name}</Cell>
          <CellRight>{daysInWords(avgDaysAlive)}</CellRight>
          <CellRight>{daysInWords(avgDaysOutdated)}</CellRight>
        </tr>
        {this.state.showDevices && [
          <DeviceRow key={name + 'devices'}>
            <Th>Device</Th>
            <Th>Current Version</Th>
            <LifetimeHead>Lifetime</LifetimeHead>
            <OutdatedHead>Outdated Time</OutdatedHead>
          </DeviceRow>,
          devices.map(({codename, name, updates}) => {
            const currentVersion = updates[updates.length - 1].release.version;

            const isCurrentMinor = currentVersion === MOST_RECENT_VERSION;

            let versionBackground;
            if (isCurrentMinor) {
              versionBackground = VERSION_COLORS.CURRENT;
            } else if (isCurrentMajor(currentVersion)) {
              versionBackground = VERSION_COLORS.MINOR_BEHIND;
            } else {
              versionBackground = VERSION_COLORS.MAJOR_BEHIND;
            }

            return (
              <DeviceRow key={codename}>
                <Cell>{name}</Cell>
                <Cell style={{background: versionBackground}}>{currentVersion}</Cell>
                <CellRight>
                  {isCurrentMajor(currentVersion) || isCurrentMinor
                    ? <em>{!isCurrentMinor && '(probably) '}still alive</em>
                    : daysInWords(daysAlive[codename])
                  }
                </CellRight>
                <CellRight>{daysInWords(daysOutdated[codename])}</CellRight>
              </DeviceRow>
            );
          })
        ]}
      </tbody>
    )
  }

}

export default () => (
  <div style={{fontFamily: 'sans-serif'}}>
    <Head>
      <title>{PAGE_TITLE}</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
    </Head>
    <GithubCorner href="https://github.com/gregoor/outdroided"/>
    <h1 style={{textAlign: 'center'}}>{PAGE_TITLE}</h1>
    <table style={{borderSpacing: 0, margin: '0 auto'}}>
      <tbody>
        <tr>
          <Th>Maintainer</Th>
          <Th/>
          <LifetimeHead>Avg Lifetime</LifetimeHead>
          <OutdatedHead>Avg Outdated Time</OutdatedHead>
        </tr>
      </tbody>
      {db.maintainer.map((maintainer) => <Maintainer key={maintainer.name} {...maintainer}/>)}
    </table>
  </div>
)
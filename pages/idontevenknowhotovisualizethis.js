//@flow

import {addMonths, differenceInDays, differenceInMonths, format} from 'date-fns';

import versionsByCodename from '../data/versions';

function times(n, cb) {
  let result = [];
  for (let i = 0; i < n; i++) {
    result.push(cb(i));
  }
  return result;
}

const colors = {
  cupcake: 'grey',
  donut: '#52ae53',
  eclair: '#fc961f',
  froyo: '#9a2dae',
  gingerbread: '#f03f3b',
  honeycomb: '#fdbf27',
  icecreamsandwich: '#35adf0',
  jellybean: '#8dc250',
  kitkat: '#ec3b3f',
  lollipop: '#25abf2',
  marshmallow: '#1b9688',
  nougat: '#7e57c2'
};

const DAY_WIDTH = 5;

const MONTHS_PER_MARKER = 2;

const startAt = versionsByCodename[0].versions[0].releasedAt;
const totalDays = differenceInDays(new Date(), startAt);

export default () => (
  <div style={{position: 'flex', width: '100%', height: '100%', background: '#f9f9f9', fontFamily: 'sans-serif'}}>
    <h1>Out-Droided</h1>
    <div style={{display: 'flex', width: totalDays * DAY_WIDTH}}>
      {times(differenceInMonths(new Date(), startAt) / MONTHS_PER_MARKER, (n) => {
        const markerAt = addMonths(startAt, n * MONTHS_PER_MARKER);
        return (
          <div style={{
            position: 'absolute',
            left: differenceInDays(markerAt, startAt) * DAY_WIDTH,
            borderLeft: '1px solid black',
            paddingLeft: 5,
            color: 'grey'
          }}>
            {format(markerAt, 'MMM/YYYY')}
          </div>
        );
      })}
      <br/>
      {versionsByCodename.map(({id, name, versions}) => {
        const codenameStartAt = versions[0].releasedAt;
        return (
          <div
            key={id}
            style={{
              position: 'absolute',
              left: differenceInDays(codenameStartAt, startAt) * DAY_WIDTH,
              borderLeft: '2px solid black',
              paddingLeft: 3,
              whiteSpace: 'nowrap',
              color: colors[id],
            }}
          >
            <span style={{fontWeight: 'bold'}}>{name}</span>
            {versions.map(({version, releasedAt}, i) => (
              <div
                key={version}
                style={{
                  position: 'absolute',
                  left: differenceInDays(releasedAt, codenameStartAt) * DAY_WIDTH,
                  borderLeft: i === 0 ? 'none' : '1px solid black',
                  paddingLeft: 3,
                  color: '#bfbfbf'
                }}
              >
                {version}
                </div>
            ))}
            <br/>
            <br/>
          </div>
        );
      })}
    </div>
  </div>
)
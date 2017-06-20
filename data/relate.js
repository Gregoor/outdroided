// @flow

const db = {};

function insert([name, [...fieldDefs]], records) {
  const newRecords = records.map((fields) => {
    const record = {};
    for (let i = 0; i < fields.length; i++) {
      const def = fieldDefs[i];
      const val = fields[i];
      if (Array.isArray(val)) {
        record[def[0] + 's'] = insert(def, val).map((newChildren) => {
          newChildren[name] = record;
          return newChildren;
        });
      } else {
        record[def] = val;
      }
    }
    return record;
  });
  (db[name] ? db[name] : (db[name] = [])).push(...newRecords);
  return newRecords;
}

export function relate(...stores) {
  for (const [def, ...records] of stores) {
    insert(def, records);
  }

  for (const [name, records] of Object.entries(db)) {
    for (const record of records) {
      for (const [fieldName, value] of Object.entries(record)) {
        if (fieldName.includes('.')) {
          const [relatedKey, field] = fieldName.split('.');
          const relatedRecord = record[relatedKey] = db[relatedKey].find((r) => r[field] === value);
          (relatedRecord[name] ? relatedRecord[name] : relatedRecord[name] = []).push(record);
          delete record[fieldName];
        }
      }
    }
  }
  
  for (const records of Object.values(db)) for (const record of records) {
    Object.freeze(record);
  }
  
  return db;
}
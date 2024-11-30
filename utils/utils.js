function pickFields(source, fields) {
    return fields.reduce((obj, key) => {
      if (source[key] !== undefined) obj[key] = source[key];
      return obj;
    }, {});
  }
  
  module.exports = { pickFields };
  
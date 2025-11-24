const axios = require('axios');
const qs = require('qs');

module.exports = {
  
  // -------- GET request --------
  Get: async function(url, params = {}, headers = {}) {
    try {
      const response = await axios.get(url, {
        params: params,
        paramsSerializer: (p) => qs.stringify(p),
        headers: headers,
        timeout: 15000,
        validateStatus: () => true
      });

      // parse JSON an toàn
      try {
        return JSON.parse(response.data);
      } catch (e) {
        return response.data || null;
      }

    } catch (err) {
      console.warn("REQUEST GET FAILED:", err.message);
      return {
        StatusCode: 1,
        data: null
      };
    }
  },

  // -------- POST request --------
  Post: async function(options = {}) {
    try {
      const response = await axios({
        method: 'POST',
        url: options.url,
        data: options.form || options.body || options.data || {},
        headers: options.headers || {},
        timeout: 15000,
        validateStatus: () => true
      });

      try {
        return JSON.parse(response.data);
      } catch (e) {
        return response.data || null;
      }

    } catch (err) {
      console.warn("REQUEST POST FAILED:", err.message);
      return {
        StatusCode: 1,
        data: null
      };
    }
  }

};

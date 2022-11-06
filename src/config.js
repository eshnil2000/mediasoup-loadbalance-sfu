const os = require('os')
const ifaces = os.networkInterfaces()
const http = require('http');
const request = require('request');

const promisifiedRequest = function(options) {
  return new Promise((resolve,reject) => {
    request(options, (error, response, body) => {
      if (response) {
        return resolve(response);
      }
      if (error) {
        return reject(error);
      }
    });
  });
};

(async function() {
  const options = {
    url: 'http://checkip.amazonaws.com',
    method: 'GET',

  };

  let response = await promisifiedRequest(options);
  let x=response.body.replace(/[\n\r]+/g, '');
  console.log(x);
  
})();

const  getPublicIp = () => {
   http.get('http://checkip.amazonaws.com', (resp) => {
    //console.log(resp);
  let data = '';
  // A chunk of data has been received.
  resp.on('data', (chunk) => {
    data += chunk;
    console.log('data' + data);
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
    let x=data.replace(/[\n\r]+/g, '');
    console.log(x.toString());
    return(x.toString());

  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});

}

const getLocalIp = () => {
  let localIp = '127.0.0.1'
  Object.keys(ifaces).forEach((ifname) => {
    for (const iface of ifaces[ifname]) {
      // Ignore IPv6 and 127.0.0.1
      if (iface.family !== 'IPv4' || iface.internal !== false) {
        continue
      }
      // Set the local ip to the first IPv4 address found and exit the loop
      localIp = iface.address
      console.log('IP address:' + localIp)
      return
    }
  })
  return localIp
}



module.exports = {
  listenIp: '0.0.0.0',
  listenPort: 3016,
  sslCrt: '../ssl/cert.pem',
  sslKey: '../ssl/key.pem',
  promisifiedRequest,

  mediasoup: {
    // Worker settings
    numWorkers: Object.keys(os.cpus()).length,
    worker: {
      rtcMinPort: 10000,
      rtcMaxPort: 10100,
      logLevel: 'warn',
      logTags: [
        'info',
        'ice',
        'dtls',
        'rtp',
        'srtp',
        'rtcp'
        // 'rtx',
        // 'bwe',
        // 'score',
        // 'simulcast',
        // 'svc'
      ]
    },
    // Router settings
    router: {
      mediaCodecs: [
        {
          kind: 'audio',
          mimeType: 'audio/opus',
          clockRate: 48000,
          channels: 2
        },
        {
          kind: 'video',
          mimeType: 'video/VP8',
          clockRate: 90000,
          parameters: {
            'x-google-start-bitrate': 1000
          }
        }
      ]
    },
    // WebRtcTransport settings
    webRtcTransport: {
      listenIps: [
        {
          ip: '0.0.0.0',
	        announcedIp: getPublicIp()
        }
      ],
      maxIncomingBitrate: 1500000,
      initialAvailableOutgoingBitrate: 1000000
    }
  }
}

(function () {

  console.log('Plugin Probe started')

  class ProbeReadFunction {

    async execute([valuePropertyValue, probePropertyValue], listItem) {

      const [value, probe] = await zySdk.services.dictionary.getValues([valuePropertyValue.value, probePropertyValue.value])

      if(value === undefined) {
        return '-'
      }

      const decodedValue = this.convertStringToUint8Array(value)

      const temperature = this.calculateTemperature(decodedValue, probe)

      return temperature + ' °'
    }

    convertStringToUint8Array(stringArray) {

      const cleanedString = stringArray.replace(/[\[\]\s]/g, '')

      const stringElements = cleanedString.split(',')

      const numberArray = stringElements.map(element => parseInt(element, 16))

      if (numberArray.some(isNaN)) {
        throw new Error('The value is not valid');
      }

      return new Uint8Array(numberArray)
    }

    calculateTemperature(bytes, probe) {

      let tempLowByte;
      let tempHighByte;

      if (probe === 'probe-1') {
        tempLowByte = bytes[0];
        tempHighByte = bytes[1];

      } else if (probe === 'probe-2') {

        tempLowByte = bytes[2];
        tempHighByte = bytes[3];
      }

      const tempHex = (tempHighByte << 8) | tempLowByte;

      const temperature = tempHex / 10;

      return temperature;
    }
  }

  const zyProbeReadFunction = new ProbeReadFunction()

  const IconData = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path fill="#ffffff" d="M14.88,16.29L13,18.17V14.41M13,5.83L14.88,7.71L13,9.58M17.71,7.71L12,2H11V9.58L6.41,5L5,6.41L10.59,12L5,17.58L6.41,19L11,14.41V22H12L17.71,16.29L13.41,12L17.71,7.71Z" />
  </svg>`;

  const ProbeReadMetadata = {
    id: 'zyllio-probe-read',
    icon: IconData,
    label: 'Probe read',
    category: 'Bluetooth',
    format: 'text',
    properties: [{
      id: 'value',
      name: 'Read from',
      type: 'text',
      tootip: '',
      default: '',
      main: true
    }, {
      id: 'probe',
      name: 'Probe',
      type: 'options',
      tootip: '',
      options: ['probe-1', 'probe-2'],
      default: 'probe-1'
    }]
  }

  zySdk.services.registry.registerFunction(ProbeReadMetadata, zyProbeReadFunction)

})();
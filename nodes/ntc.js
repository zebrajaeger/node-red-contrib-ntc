
module.exports = function (RED) {
    function NTC(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.name = config.name;
        node.adcMaxValue = parseInt(config.adcMaxValue);
        node.resistor = parseInt(config.resistor);
        node.ntcValue = parseInt(config.ntcValue);
        node.ntcTemperature = parseInt(config.ntcTemperature);
        node.ntcB = parseInt(config.ntcB);

        this.on('input', function (msg) {
            let v = msg.payload;

            const t = calcTemperature(
                node.resistor,
                node.ntcB, node.ntcValue, node.ntcTemperature,
                node.adcMaxValue, msg.payload,
            )

            this.status({ fill: "red", shape: "dot", text: t.temperature.toFixed(2) + '°C' });

            node.send({ payload: t });
        });

        function calcTemperature(
            R_fixed,
            B, R0, T0_Celsius,
            Vcc, Vout) {
            const T0 = T0_Celsius + 273.15; // Celsius to Kelvin

            function calculateNTCResistance(Vcc, Vout, R_fixed) {
                return R_fixed * (Vcc / Vout - 1);
            }

            function calculateTemperature(resistance) {
                const temperatureK = 1 / (1 / T0 + (1 / B) * Math.log(resistance / R0));
                const temperatureC = temperatureK - 273.15; // as Celsius
                return temperatureC;
            }

            const R_ntc = calculateNTCResistance(Vcc, Vout, R_fixed);

            const temperature = calculateTemperature(R_ntc);

            return { R_ntc, temperature };
        }
    }

    RED.nodes.registerType("NTC", NTC);
}

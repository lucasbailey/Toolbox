function Conversions() {

    var _HEX_CLEANUP_PATTERN = /[^a-fA-F0-9]/g;
    var _DEC_CLEANUP_PATTERN = /[^0-9]/g;

    var _HEX_BASE = 16;
    var _DEC_BASE = 10;
    var _BIN_BASE = 2;
    var _OCT_BASE = 8

    this.HexToDecimal = function (hex, bolReverse) {
        bolReverse = (bolReverse == null || typeof bolReverse == 'undefined' ? false : bolReverse);

        //clean up the data
        hex = String(hex).replace(_HEX_CLEANUP_PATTERN, "");

        var toBase = (bolReverse ? _DEC_BASE : _HEX_BASE);
        var fromBase = (bolReverse ? _HEX_BASE : _DEC_BASE);

        if (hex == "") {
            return "";
        }
        return _DoConvert(hex, toBase, fromBase);
    };

    this.DecToBinary = function (dec, bolReverse) {
        bolReverse = (bolReverse == null || typeof bolReverse == 'undefined' ? false : bolReverse);

        //clean up the data
        dec = String(dec).replace(_DEC_CLEANUP_PATTERN, "");

        var toBase = (bolReverse ? _DEC_BASE : _BIN_BASE);
        var fromBase = (bolReverse ? _BIN_BASE : _DEC_BASE);

        if (dec == "") {
            return "";
        }
        return _DoConvert(dec, fromBase, toBase);
    };

    this.HexToBinary = function (hex, bolReverse) {
        bolReverse = (bolReverse == null || typeof bolReverse == 'undefined' ? false : bolReverse);

        //clean up the data
        hex = String(hex).replace(_HEX_CLEANUP_PATTERN, "");

        var toBase = (bolReverse ? _HEX_BASE : _BIN_BASE);
        var fromBase = (bolReverse ? _BIN_BASE : _HEX_BASE);

        if (hex == "") {
            return "";
        }
        return _DoConvert(hex, fromBase, toBase);
    };

    function _DoConvert(value, fromBase, toBase) {
        return parseInt(value, fromBase).toString(toBase);
    }
}
/**
 * Created by skykingit on 2018/12/30.
 */
const Web3 = require("pweb3");
const EthTx = require("pchainjs-tx");
const TxData = require("txdata");
const CryptoJS = require("crypto-js");
const BigNumber = require('bignumber.js');
window.angularApp = angular.module('myApp', []);

function AESEncrypt(msg, password) {
    return CryptoJS.AES.encrypt(msg, password).toString();
}

function AESDecrypt(enMsg, password) {
    return CryptoJS.AES.decrypt(enMsg, password).toString(CryptoJS.enc.Utf8);
}

function loading() {
    var html = '<div class="loading"><div class="pic"><div class="myloader"></div></div></div>';
    $('body').append(html);
}

function removeLoading() {
    $('body').find('.loading').remove();
}

function removePageLoader() {
    $(".page-loader-wrapper").hide();
}

setTimeout(removePageLoader, 1500);

function showPopup(str, time, callback) {
    if (!time) time = 3000;
    var html = '<div class="popup"><div class="pContent"><p>' + str + '</p></div></div>';
    $('body').append(html);
    setTimeout(function() {
        removePopup();
        if (callback)
            callback();
    }, time)
}

function removePopup() {
    $('body').find('.popup').remove();
}

function showNotification(colorName, text, placementFrom, placementAlign, animateEnter, animateExit, time) {
    if (colorName === null || colorName === '') { colorName = 'bg-black'; }
    if (text === null || text === '') { text = 'Turning standard Bootstrap alerts'; }
    if (animateEnter === null || animateEnter === '') { animateEnter = 'animated fadeInDown'; }
    if (animateExit === null || animateExit === '') { animateExit = 'animated fadeOutUp'; }
    if (time === null || time === '') { time = 2000; }

    var allowDismiss = true;

    $.notify({
        message: text
    }, {
        type: colorName,
        allow_dismiss: allowDismiss,
        newest_on_top: true,
        timer: time,
        placement: {
            from: placementFrom,
            align: placementAlign
        },
        animate: {
            enter: animateEnter,
            exit: animateExit
        },
        template: '<div data-notify="container" class="bootstrap-notify-container myNotify alert alert-dismissible {0} ' + (allowDismiss ? "p-r-35" : "") + '" role="alert">' +
            '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
            '<span data-notify="icon"></span> ' +
            '<span data-notify="title">{1}</span> ' +
            '<span data-notify="message" class="message">{2}</span>' +
            '<div class="progress" data-notify="progressbar">' +
            '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
            '</div>' +
            '<a href="{3}" target="{4}" data-notify="url"></a>' +
            '</div>'
    });
}

function successNotify(text) {
    showNotification("alert-success", text, "bottom", "center", 400000);
}
const Clipboard = require("clipboard");
var clipboard = new Clipboard('.copyBtn');

clipboard.on('success', function(e) {
    showNotification("alert-success", "Copy successfully", "bottom", "center", 1000);
});

function menuActive(index) {
    var menuEle = $("html #leftsidebar .menu li");
    if (menuEle.length < 1) {
        setTimeout(function() { menuActive(index); }, 2000);
    } else {
        menuEle.removeClass("active");
        menuEle.removeClass("open");
        menuEle.eq(index).addClass("active");
        menuEle.eq(index).addClass("open");
    }
}

function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return (decodeURI(r[2]));
    return null;
}

function priToAddress(pri) {
    if (pri.length == 64) {
        pri = "0x" + pri;
    };
    var addr = "0x" + ethUtil.privateToAddress(pri).toString('hex');
    return addr;
}

function signTx(pri, txObj) {

    //console.log(arguments);
    // var Tx = EthTx;
    var Tx = require("pchainjs-tx");

    var privateKey = new Buffer(pri, 'hex')

    var tx = new Tx(txObj);

    tx.sign(privateKey);

    var serializedTx = tx.serialize();

    var txData = "0x" + serializedTx.toString('hex');

    return txData;
}


function convert(num) {
    var x = new BigNumber(num);
    var s = "0x" + x.toString(16);
    // console.log(num,s);
    return s;
}

function padLeftEven(hex) {
    hex = hex.length % 2 != 0 ? '0' + hex : hex;
    return hex;
};

function sanitizeHex(hex) {
    hex = hex.substring(0, 2) == '0x' ? hex.substring(2) : hex;
    if (hex == "") return "";
    return '0x' + padLeftEven(hex);
};



function decimalToHex(dec) {
    return new BigNumber(dec).toString(16);
};

function getHexValue(val) {
    var s = sanitizeHex(decimalToHex(val));

    // console.log(s);
}

function initSignRawPAI(toAddress, amount, nonce, gasPrice, gasLimit, chainId) {
    //console.log(toAddress,amount,nonce,gasPrice,gasLimit);

    const rawTx = {
        nonce: convert(nonce),
        gasPrice: convert(gasPrice),
        gasLimit: convert(gasLimit),
        to: toAddress,
        value: convert(amount),
        chainId: chainId
    };

    return rawTx;
}

function initSignRawCrosschain(data, nonce, gasPrice, gasLimit, chainId) {
    const rawTx = {
        nonce: convert(nonce),
        gasPrice: convert(gasPrice),
        gasLimit: convert(gasLimit),
        data: data,
        to: "0x0000000000000000000000000000000000000065",
        chainId: chainId
    };
    return rawTx;
}

function initSignRawContract(toAddress, data, nonce, gasPrice, gasLimit, amount, chainId) {
    const rawTx = {
        nonce: convert(nonce),
        gasPrice: convert(gasPrice),
        gasLimit: convert(gasLimit),
        to: toAddress,
        data: data,
        value: convert(amount),
        chainId: chainId
    };
    return rawTx;
}

var APIHost = "https://air.pchain.wang";

var crossChainABI = [{
        "type": "function",
        "name": "DepositInMainChain",
        "constant": false,
        "inputs": [{
                "name": "chainId",
                "type": "string"
            },
            {
                "name": "amount",
                "type": "uint256"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "DepositInChildChain",
        "constant": false,
        "inputs": [{
                "name": "chainId",
                "type": "string"
            },
            {
                "name": "txHash",
                "type": "bytes32"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "WithdrawFromChildChain",
        "constant": false,
        "inputs": [{
                "name": "chainId",
                "type": "string"
            },
            {
                "name": "amount",
                "type": "uint256"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "WithdrawFromMainChain",
        "constant": false,
        "inputs": [{
                "name": "chainId",
                "type": "string"
            },
            {
                "name": "amount",
                "type": "uint256"
            },
            {
                "name": "txHash",
                "type": "bytes32"
            }
        ],
        "outputs": []
    }
]
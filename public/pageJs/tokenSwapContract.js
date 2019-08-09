var Accounts = new Accounts();
const {ipcRenderer} = require('electron');
const {shell} = require('electron');
const schedule = require('node-schedule');

angularApp.controller('myCtrl', function($scope, $http) {
     $scope.gasLimit = 60000;
     $scope.gasPrice = 10;
     $scope.nonce = 0;
     $scope.balance = 0;
     $scope.maxSendAmount = 0;

    $scope.getPlayLoad = function(abi, funName, paramArr) {
        var playLoadData = TxData(abi, funName, paramArr);
        return playLoadData;
    }

     $scope.getBalance = function() {
         $scope.spin = "myIconSpin";
         var funcData = $scope.getPlayLoad(balanceABI, "balanceOf", [$scope.erc20account.address]);
         var callObj = { to: contractAddress, data: funcData };
         var obj = {};
         obj.callObj = callObj;
         var url = APIHost + "/getErc20Balance";
         $http({
             method: 'POST',
             url: url,
             data: obj
         }).then(function successCallback(res) {
             $scope.spin = "";
             removePageLoader();
             if (res.data.result == "success") {
                 $scope.balance = res.data.data;
                 $scope.getMaxSendAmount();
             } else {
                 showPopup(res.data.error, 3000);
             }

         }, function errorCallback(res) {
             showPopup("Internet error, please refresh the page");
         });

         queryErc20PiInfoTXList($scope.erc20account.address, ethChainId).then(function(robj) {
             $scope.transactionERC20List = robj.data;
             $scope.$apply();
         });

     }

    $scope.getMaxSendAmount = function() {
        let b = new BigNumber($scope.balance);
        $scope.maxSendAmount = b.decimalPlaces(18);
    }

     $scope.nonceFlag = true;
     $scope.getErc20Nonce = function() {
         $scope.nonceFlag = false;
         var obj = {};
         obj.address = $scope.erc20account.address;
         //console.log(obj);
         // obj.chainId = 1;
         // var url = APIHost + "/getNonce";
         var url = localhostHost + "/getErc20Nonce";
         $http({
             method: 'POST',
             url: url,
             data: obj
         }).then(function successCallback(res) {
             if (res.data.result == "success") {
                 console.log(res);
                 $scope.nonce = Number(res.data.nonce);
                 $scope.gasPrice=res.data.gas;
                 $scope.nonceFlag = true;

             } else {
                 showPopup(res.data.message, 3000);
             }
         }, function errorCallback(res) {
             showPopup("Internet error, please refresh the page");
         });
     }

    $scope.childNonceFlag = true;
    $scope.getChildNonce = function() {
        $scope.childNonceFlag = false;
        var obj = {};
        obj.address = $scope.swapTo;
        // var url = APIHost + "/getNonce";
        var url = localhostHost + "/getChildNonce";
        $http({
            method: 'POST',
            url: url,
            data: obj
        }).then(function successCallback(res) {
            if (res.data.result == "success") {
                console.log(res);
                $scope.childNonce = Number(res.data.nonce);
                $scope.childNonceFlag = true;
            } else {
                showPopup(res.data.message, 3000);
            }
        }, function errorCallback(res) {
            showPopup("Internet error, please refresh the page");
        });
    }

    $scope.refundNonceFlag = true;
    $scope.getErc20RefundFromNonce = function() {
        $scope.refundNonceFlag = false;
        var obj = {};
        obj.address = $scope.refundFrom;
        // obj.chainId = 1;
        // var url = APIHost + "/getNonce";
        var url = localhostHost + "/getErc20Nonce";
        $http({
            method: 'POST',
            url: url,
            data: obj
        }).then(function successCallback(res) {
            if (res.data.result == "success") {
                console.log(res);
                $scope.refundFromNonce = Number(res.data.nonce);
                $scope.refundNonceFlag = true;
            } else {
                showPopup(res.data.message, 3000);
            }
        }, function errorCallback(res) {
            showPopup("Internet error, please refresh the page");
        });
    }


    $scope.withdrawFlag = false;
    $scope.refundFlag = false;

     $scope.accountList = new Array();

     $scope.erc20accountList = new Array();

     queryErc20AccountList().then(function(resObj) {
         $scope.erc20accountList = resObj.data;
         try {
             if ($scope.erc20accountList.length > 0) {
                 $scope.erc20account = $scope.erc20accountList[0];
                 $scope.getBalance();
             }
             if ($scope.erc20accountList.length == 0) {
                 removePageLoader();
             }
         } catch (e) {
             console.log(e);
         }
     }).catch(function(e) {
         console.log(e, "error");
     });

     queryAccountList().then(function(resObj) {
         $scope.accountList = resObj.data;
         try {
             if ($scope.accountList.length > 0) {
                 $scope.account = $scope.accountList[0];
                 // $scope.getBalance();
                 queryErc20PiInfoTXList($scope.account.address, piChainId).then(function(robj) {
                     $scope.transactionList = robj.data;
                     $scope.$apply();
                 });
             }
             if ($scope.accountList.length == 0) {
                 removePageLoader();
             }
         } catch (e) {
             console.log(e);
         }
     }).catch(function(e) {
         console.log(e, "error");
     });


     $scope.currentPrivateKey = "";
     $scope.confirmPassword = function() {
         if ($scope.account == undefined) {
             swal("Please create a wallet address at first");
             return;
         }
         queryErc20PrivateKey($scope.erc20account.address).then(function(result) {
             if (result.result == "success") {
                 var dePri = AESDecrypt(result.data.privateKey, $scope.inputPassword);
                 if (dePri) {
                     $scope.currentPrivateKey = dePri;
                     $scope.inputPassword = "";
                     $scope.$apply();
                     $('#enterPassword').modal('hide');
                     $scope.submit();

                 } else {
                     swal("Password error");
                 }
             } else {
                 swal("Password error");
             }
         }).catch(function(e) {
            console.log(e);
             swal("Password error");
         });
     };

    $scope.showEnterPwdPI = function(swapToHash,swapTo) {

        $scope.swapToHash = swapToHash;

        $scope.swapTo = swapTo;

        $scope.getChildNonce();

        $('#enterPasswordPI').modal('show');

    }

    $scope.showEnterRefundPI = function(refundHash,refundFrom) {

        $scope.refundHash = refundHash;

        $scope.refundFrom = refundFrom;

        $scope.getErc20RefundFromNonce();

        $('#enterPasswordRefundPI').modal('show');

    }


     $scope.selectAccount = function() {
         // $scope.getNonce();
         // $scope.getBalance();
         queryErc20PiInfoTXList($scope.account.address, piChainId).then(function(robj) {
             $scope.transactionList = robj.data;
             $scope.$apply();
         });
     }

     $scope.selectErc20Account = function() {
         $scope.getErc20Nonce();
         $scope.getBalance();
     }

    $scope.showEnterPwd = function() {
        $scope.getMaxSendAmount();
        if ($scope.maxSendAmount.lt(new BigNumber($scope.toAmount))) {
            let tips1 = "Insufficient Balance ";
            let tips2 = "Max Amount :" + $scope.maxSendAmount + " PI";
            swal(tips1, tips2, "error");
        } else {
            $('#enterPassword').modal('show');
        }
    }

    $scope.getPlayLoad = function(abi, funName, paramArr) {
        var playLoadData = TxData(abi, funName, paramArr);
        return playLoadData;
    }


     var web3 = new Web3();
     $scope.submit = function() {
         $scope.getErc20Nonce();
         var txFee = $scope.gasLimit * $scope.gasPrice * Math.pow(10, 9);
         $scope.txFee = web3.fromWei(txFee, 'ether');
         $('#transaction').modal('show');
     }

     $scope.gasChanged = function() {
         $scope.gasPrice = jQuery("#gasPrice").val();

     }

    $scope.checkAllowance = function() {
        var obj = {};
        obj.funCode = ALLOWANCE;
        obj.owner = $scope.erc20account.address;
        obj.spender = HashedTimelockERC20ContractAddress;
        obj.PAIStandardTokenContractAddress = PAIStandardTokenContractAddress;
        obj.amount = $scope.toAmount;

        var url = localhostHost + "/checkAllowance";
        $http({
            method: 'POST',
            url: url,
            data: obj
        }).then(function successCallback(res) {
            if (res.data.result == "success") {

                console.log(res);

                if (res.data.allowance == 0) {

                    console.log("直接调用approve");

                    $scope.approve($scope.toAmount);

                } else if (res.data.allowance >= $scope.toAmount) {

                    console.log("直接运行newContract");

                    $scope.sendTx();

                } else if (res.data.allowance < $scope.toAmount) {

                    console.log("先把amount设置为0，然后再设置成当前amount");

                    $scope.approve(0);

                }
            } else {
                showPopup(res.data.message, 3000);
                $('#transaction').modal('hide');
            }
        }, function errorCallback(res) {
            showPopup("Internet error, please refresh the page");
            $('#transaction').modal('hide');
        });
    }

    $scope.approve = function(amount) {
        try {

            $scope.amount = amount;

            var paramArr = [HashedTimelockERC20ContractAddress,$scope.amount];

            var data = $scope.getPlayLoad(approveABI,APPROVE,paramArr);

            var nonce = $scope.nonce;

            var GASPRICE = 180000000000;
            var GASLIMIT = 600000;

            var signRawObj = initEthSignRawContract(nonce, GASPRICE, GASLIMIT,PAIStandardTokenContractAddress,data);

            var signData = signEthTx($scope.currentPrivateKey, signRawObj);

            var obj = {};
            obj.crossType = crossType;
            obj.signData = signData;
            obj.funCode = APPROVE;
            obj.chainId = ethChainId;

            var url = localhostHost + "/sendRawTxCrossToken";
            $http({
                method: 'POST',
                url: url,
                data: obj
            }).then(function successCallback(res) {
                if (res.data.result == "success") {

                    console.log("Approve Success!");

                    if ($scope.amount == 0) {
                        $scope.approve($scope.toAmount);
                    }

                } else {
                    showPopup("Approve Error!",res.message.toString(),5000);
                }
            }, function errorCallback(res) {
                console.log(res);
                showPopup("Internet error, please refresh the page");
            });
        } catch (e) {
            console.log(e);
            showPopup("Internet error, please refresh the page");
        }
    }


    $scope.refund = function() {
        try {
            queryPrivateKey($scope.refundFrom).then(function(result) {

                if (result.result == "success") {

                    var accountPri = AESDecrypt(result.data.privateKey, $scope.inputPasswordRefundPI);

                    if (accountPri) {
                        $scope.currentPrivateKeyETH = accountPri;

                        queryTOaddress($scope.refundHash,$scope.refundFrom).then(function(wdata) {
                            if (wdata.result == "success") {

                                $scope.ethContractId = wdata.data.ethContractId;

                                var paramArr = [$scope.ethContractId];

                                var data = $scope.getPlayLoad(refundABI,REFUND,paramArr);

                                var nonce = $scope.refundFromNonce;

                                var GASPRICE = 180000000000;
                                var GASLIMIT = 600000;

                                var signRawObj = initEthSignRawContract(nonce, GASPRICE, GASLIMIT,HashedTimelockERC20ContractAddress,data);

                                // console.log($scope.currentPrivateKey);

                                var signData = signEthTx($scope.currentPrivateKey, signRawObj);

                                var obj = {};
                                obj.crossType = crossType;
                                obj.signData = signData;
                                obj.funCode = REFUND;
                                obj.chainId = piChainId;

                                var wurl = localhostHost + "/sendRawTxCrossToken";
                                // var wurl = APIHost + "/sendRawTxCrossToken";
                                $http({
                                    method: 'POST',
                                    url: wurl,
                                    data: obj
                                }).then(function successCallback(wres) {
                                    showPopup("Token swap is in progress, Refund Success, thank you", 8000);

                                    $('#enterPasswordRefundPI').modal('hide');

                                    if (wres.data.result == "success") {
                                            var uobj = {};
                                            uobj.hash = $scope.refundHash;
                                            uobj.ethContractId = 0;
                                            uobj.piContractId = 0;
                                            uobj.status = 0;
                                            uobj.chainId = ethChainId;
                                            updateErc20PiInfo(uobj).then(function(wdobj) {
                                            if (wdobj.result == "success") {
                                                queryErc20PiStatusList($scope.refundFrom,ethChainId).then(function(wdata) {
                                                    $scope.transactionList = wdata.data;
                                                    $scope.$apply();
                                                    queryErc20PiInfoTXList($scope.refundFrom,ethChainId).then(function(wddata) {
                                                        $scope.transactionERC20List = wddata.data;
                                                        $scope.$apply();
                                                    });
                                                });
                                            }
                                        });
                                    } else {
                                        swal("Refund Error",wres.data.message.toString(),"error");
                                    }

                                });

                            } else {

                                $('#enterPasswordPI').modal('hide');
                                console.log("当前数据不存在！");
                                swal("Query error");
                            }

                        });
                    } else {
                        $('#enterPasswordPI').modal('hide');
                        swal("Query error");
                    }
                } else {

                    $('#enterPasswordPI').modal('hide');
                    swal("Query error");
                }
            }).catch(function(e) {

                $('#enterPasswordPI').modal('hide');
                swal("Query error");
            });
        } catch (e) {
            console.log(e);
            showPopup("Internet error, please refresh the page");
        }
    }

    $scope.withdraw = function() {
        try {
            queryPrivateKey($scope.swapTo).then(function(result) {

                if (result.result == "success") {

                    var accountPri = AESDecrypt(result.data.privateKey, $scope.inputPasswordPI);

                    if (accountPri) {
                        $scope.currentPrivateKeyPI = accountPri;

                        // var preimage = AESDecrypt($scope.preimageAESEncrypt,$scope.currentPrivateKey);
                        // console.log("----preimageAESDecrypt",preimage);

                        queryTOaddress($scope.swapToHash,$scope.swapTo).then(function(wdata) {
                            if (wdata.result == "success") {

                                $scope.ethContractId = wdata.data.ethContractId;
                                $scope.piContractId = wdata.data.piContractId;
                                $scope.preimage = wdata.data.preimage;

                                var wparamArr = [$scope.piContractId, $scope.preimage];

                                var wdata = $scope.getPlayLoad(withdrawABIPI,WITHDRAW,wparamArr);

                                var pnonce = $scope.childNonce;

                                var GASPRICE = 100000000000;
                                var GASLIMIT = 500000;

                                //toAddress, data, nonce, gasPrice, gasLimit, amount, chainId
                                var wsignRawObj = initSignRawContract(HashedTimelockContractAddress, wdata, pnonce, GASPRICE, GASLIMIT, 0, piChainId);

                                var wsignData = signTx($scope.currentPrivateKeyPI, wsignRawObj);

                                $scope.currentPrivateKeyPI = "";

                                var obj = {};
                                obj.crossType = crossType;
                                obj.signData = wsignData;
                                obj.funCode = WITHDRAW;
                                obj.chainId = piChainId;

                                var wurl = localhostHost + "/sendRawTxCrossToken";

                                // var wurl = APIHost + "/sendRawTxCrossToken";
                                $http({
                                    method: 'POST',
                                    url: wurl,
                                    data: obj
                                }).then(function successCallback(wres) {
                                    showPopup("Token swap is in progress, please check the balance later, thank you", 8000);
                                    $('#enterPasswordPI').modal('hide');
                                    console.log("------------wres-------", wres);

                                    if (wres.data.result == "success") {

                                        var objw = {};
                                        objw.chainId = piChainId;
                                        objw.funCode = WITHDRAW;
                                        objw.preimage = $scope.preimage;
                                        objw.fromaddress = $scope.swapTo;
                                        objw.toaddress = HashedTimelockContractAddress;
                                        objw.value = 0;
                                        objw.ethContractId = $scope.ethContractId;
                                        objw.piContractId = $scope.piContractId;
                                        objw.hash = wres.data.hash;
                                        objw.status= STATUS_FAIL;
                                        createErc20PiInfo(objw).then(function(wobj) {
                                            console.log(wobj, "----withdraw----createErc20PiInfo-------------");
                                            if (wobj.result == "success") {
                                                queryErc20PiInfoTXList($scope.swapTo,piChainId).then(function(wdata) {
                                                    $scope.transactionList = wdata.data;
                                                    $scope.$apply();

                                                    var uobj = {};
                                                    uobj.hash = $scope.swapToHash;
                                                    uobj.ethContractId = $scope.ethContractId;
                                                    uobj.piContractId = $scope.piContractId;
                                                    uobj.status = "0x3";
                                                    uobj.chainId = ethChainId;
                                                    updateErc20PiInfo(uobj).then(function(wdobj) {
                                                        console.log(wdobj, "----withdraw----createErc20PiInfo-------------");
                                                        if (wdobj.result == "success") {
                                                            queryErc20PiInfoTXList($scope.erc20account.address,piChainId).then(function(wddata) {
                                                                $scope.transactionERC20List = wddata.data;
                                                                $scope.$apply();
                                                            });
                                                        }
                                                    });
                                                });
                                            }
                                        });

                                        var hash = wres.data.hash;
                                        var url = "index.html?key=" + hash + "&chain=1";
                                        var html = '<a href="' + url + '"  >Transaction hash:' + hash + '</a>';
                                        successNotify(html);
                                        swal("Success!",wres.data.message.toString(),"success");
                                    } else {

                                        swal("Withdraw Error",wres.data.message.toString(),"error");
                                    }

                                });

                            } else {

                                $('#enterPasswordPI').modal('hide');
                                console.log("当前数据不存在！");
                                swal("Query error");
                            }

                        });
                    } else {
                        $('#enterPasswordPI').modal('hide');
                        swal("Query error");
                    }
                } else {

                    $('#enterPasswordPI').modal('hide');
                    swal("Query error");
                }
            }).catch(function(e) {

                $('#enterPasswordPI').modal('hide');
                swal("Query error");
            });
        } catch (e) {
            console.log(e);
            $('#enterPasswordPI').modal('hide');
            showPopup("Internet error, please refresh the page");
        }
    }


    $scope.sendTx = function() {
        try {

            var hashPair = newSecretHashPair();
            var hashlock = hashPair.hash;
            var preimage = hashPair.secret;

            var duration = 3600 * 4;
            var timelock = nowSeconds() + duration;

            // $scope.preimageAESEncrypt = AESEncrypt(hashPair.secret,$scope.currentPrivateKey);
            // console.log(hashPair.secret, "+" , $scope.currentPrivateKey,"preimageAESEncrypt==============",preimageAESEncrypt);
            // var gasPrice = $scope.gasPrice * Math.pow(10, 9);

            var toAmount = 1;

            var paramArr = [company, hashlock, timelock, PAIStandardTokenContractAddress, toAmount, $scope.account.address];

            var data = $scope.getPlayLoad(newContractABIETH,NEWCONTRACT,paramArr);

            var nonce = $scope.nonce;

            var GASPRICE = 200000000000;
            var GASLIMIT = 800000;

            var signRawObj = initEthSignRawContract(nonce, GASPRICE, GASLIMIT,HashedTimelockERC20ContractAddress,data);

            var signData = signEthTx($scope.currentPrivateKey, signRawObj);

            $scope.currentPrivateKey = "";

            loading();

            var obj = {};
            obj.crossType = crossType;
            obj.signData = signData;
            obj.funCode = NEWCONTRACT;
            obj.chainId = ethChainId;

            var url = localhostHost + "/sendRawTxCrossToken";
            // var url =  APIHost + "/sendRawTxCrossToken";
            $http({
                method: 'POST',
                url: url,
                data: obj
            }).then(function successCallback(res) {
                swal("Success","Token swap is in progress, please check the status later, thank you","success");

                $('#transaction').modal('hide');

                if (res.data.result == "success") {
                    var objt = {};
                    objt.chainId = ethChainId;
                    objt.funCode = NEWCONTRACT;
                    objt.preimage = preimage;
                    objt.fromaddress = $scope.erc20account.address;
                    objt.toaddress = $scope.account.address;
                    objt.value = $scope.toAmount;
                    objt.ethContractId = 0;
                    objt.piContractId = 0;
                    objt.hash = res.data.hash;
                    objt.status= STATUS_FAIL;
                    createErc20PiInfo(objt).then(function(aobj) {
                        if (aobj.result == "success") {
                            queryErc20PiInfoTXList($scope.erc20account.address,ethChainId).then(function(robj) {
                                $scope.transactionERC20List = robj.data;
                                $scope.$apply();
                            });
                        }
                    });
                } else {
                    $('#transaction').modal('hide');
                    showPopup(res.message.toString(),5000);
                }
                removeLoading();

            }, function errorCallback(res) {
                console.log(res);
                $('#transaction').modal('hide');
                showPopup("Internet error, please refresh the page");
                removeLoading();
            });
        } catch (e) {
            console.log(e);
            $('#transaction').modal('hide');
            showPopup("Internet error, please refresh the page");
            removeLoading();
        }
    }

    $scope.newContractIdPI = function(ethContractIdHash,ethContractId) {
        try {

            var rawdata = {};
            rawdata.ethContractId = ethContractId;
            var objData = require('querystring').stringify(rawdata);
            $http({
                method: 'POST',
                url: wrul + "/newContractOnPchain?" + objData
            }).then(function successCallback(pres) {

                console.log(pres.data.result, "-----newContractOnPchain--result------------", pres);

                if (pres.data.result == "success" && pres.data.piContractId != undefined) {

                    var uobj = {};
                    uobj.hash = ethContractIdHash;
                    uobj.ethContractId = ethContractId;
                    uobj.piContractId = pres.data.piContractId;
                    uobj.status = "0x2";
                    uobj.chainId = ethChainId;
                    updateErc20PiInfo(uobj).then(function(udata) {

                        console.log(udata, "修改数据库并且可以进行withdraw");

                        if (udata.result == "success") {
                            $scope.withdrawFlag = true;
                            queryErc20PiInfoTXList($scope.erc20account.address,ethChainId).then(function(urdata) {
                                $scope.transactionERC20List = urdata.data;
                                $scope.$apply();
                            });
                        }
                    });
                } else {
                    var uobj = {};
                    uobj.hash = ethContractIdHash;
                    uobj.ethContractId = ethContractId;
                    uobj.piContractId = 0;
                    uobj.status = "0x2";
                    uobj.chainId = ethChainId;
                    updateErc20PiInfo(uobj).then(function(udata) {

                        console.log(udata, "当前没有返回piContractId可以进行refound");

                        if (udata.result == "success") {
                            $scope.refundFlag = true;
                            queryErc20PiInfoTXList($scope.erc20account.address,ethChainId).then(function(urdata) {
                                $scope.transactionERC20List = urdata.data;
                                $scope.$apply();
                            });
                        }
                    });
                    swal("transaction Error",e.toString(),"error");
                }
            });
        } catch (e) {
            console.log(e);
            showPopup("Internet error, please refresh the page");
        }
    }

    $scope.sysNewContractIdPI = function(address,chainId,status) {
        try {
            if (address) {
                queryErc20PiStatusList(address,chainId,status).then(function(robj) {
                    if (robj.data.length > 0) {
                        console.log("sysNewContractIdPI : ",robj);

                        for (var i=0; i<robj.data.length; i++) {

                            var hash = robj.data[i].hash;

                            var ethContractId = robj.data[i].ethContractId;

                            $scope.newContractIdPI(hash,ethContractId);
                        }

                    } else {

                        console.log(" sysNewContractIdPI , 当前没有需要修改的数据!");

                    }
                });
            } else {
                console.log(" address is not null !");
            }
        } catch (e) {
            console.log(e);
            showPopup("Internet error, please refresh the page");
        }
    }

    //每隔1分钟执行
    var rule1 = new schedule.RecurrenceRule();
    var times = [];
    for(var i=1; i<60; i++){
        times.push(i);
    }
    rule1.minute = times;
    var b=0;
    schedule.scheduleJob(rule1, function(){
        b++;

        console.log(b, "执行任务 sysReceipt : ", new Date().toLocaleString());

        $scope.sysReceiptETH($scope.erc20account.address,ethChainId,STATUS_FAIL);

        console.log(b, "执行任务 sysNewContractIdPI : ", new Date().toLocaleString());

        $scope.sysNewContractIdPI($scope.erc20account.address,ethChainId,STATUS_SUCCESS);

        $scope.sysReceiptPI($scope.account.address,piChainId,STATUS_FAIL);

    });

    $scope.sysReceiptETH = function(address,chainId,status) {
        try {
            if (address) {
                queryErc20PiStatusList(address,chainId,status).then(function(robj) {
                    if (robj.data.length > 0) {
                        console.log("sysReceipt : ",robj);

                        for (var i=0; i<robj.data.length; i++) {


                            var hash = robj.data[i].hash;

                            var funCode = robj.data[i].funCode;

                            var ethContractId = robj.data[i].ethContractId;

                            var piContractId = robj.data[i].piContractId;

                            $scope.getReceipt(ethContractId,piContractId,hash,funCode,chainId);
                        }

                    } else {

                        console.log("sysReceipt , 当前没有需要修改的数据!");

                    }
                });
            } else {
                console.log("address is not null!");
            }
        } catch (e) {
            console.log(e);
            showPopup("Internet error, please refresh the page");
        }
    }

    $scope.sysReceiptPI = function(address,chainId,status) {
        try {
            if (address) {
                queryErc20PiStatusList(address,chainId,status).then(function(robj) {
                    if (robj.data.length > 0) {
                        console.log("sysReceipt : ",robj);

                        for (var i=0; i<robj.data.length; i++) {

                            var hash = robj.data[i].hash;

                            var funCode = robj.data[i].funCode;

                            var ethContractId = robj.data[i].ethContractId;

                            var piContractId = robj.data[i].piContractId;

                            $scope.getReceipt(ethContractId,piContractId,hash,funCode,chainId);
                        }

                    } else {

                        console.log("sysReceipt , 当前没有需要修改的数据!");

                    }
                });
            } else {
                console.log("address is not null!");
            }
        } catch (e) {
            console.log(e);
            showPopup("Internet error, please refresh the page");
        }
    }


    $scope.getReceipt = function(ethContractId,piContractId,hash,funCode,chainId) {
        try {
            $scope.receiptChainId = chainId;

            var obj = {};
            obj.signedTx = hash;
            obj.funCode = funCode;
            obj.chainId = chainId;
            var url = localhostHost + "/getReceipt";
            // var url =  APIHost + "/getReceipt";
            $http({
                method: 'POST',
                url: url,
                data: obj
            }).then(function successCallback(res) {

                if (res.data.result == "success" && res.data.receipt.status == "0x1") {

                    console.log("-----getReceipt--result------------", res);

                    var obj = {};

                    if (funCode == NEWCONTRACT && $scope.receiptChainId == ethChainId) {
                        $scope.ethContractId = res.data.receipt.logs[1].topics[1];
                        $scope.transactionHash = res.data.receipt.transactionHash;

                        obj.ethContractId = res.data.receipt.logs[1].topics[1];
                        obj.piContractId = piContractId;
                    } else if (funCode == WITHDRAW && $scope.receiptChainId == piChainId) {
                        obj.ethContractId = ethContractId;
                        obj.piContractId = piContractId;
                    } else if (funCode == APPROVE && $scope.receiptChainId == ethChainId) {
                        obj.ethContractId = ethContractId;
                        obj.piContractId = piContractId;
                    }

                    obj.chainId = $scope.receiptChainId;
                    obj.hash = res.data.receipt.transactionHash;
                    obj.status= res.data.receipt.status;
                    updateErc20PiInfo(obj).then(function(aobj) {
                        if (aobj.result == "success") {
                            if (funCode == NEWCONTRACT && $scope.receiptChainId == ethChainId) {
                                $scope.newContractIdPI($scope.transactionHash, $scope.ethContractId);
                                queryErc20PiInfoTXList($scope.erc20account.address,ethChainId).then(function(robj) {
                                    $scope.transactionERC20List = robj.data;
                                    $scope.$apply();
                                });
                            }
                            if (funCode == APPROVE && $scope.receiptChainId == ethChainId) {
                                $scope.sendTx();
                                queryErc20PiInfoTXList($scope.erc20account.address,ethChainId).then(function(robj) {
                                    $scope.transactionERC20List = robj.data;
                                    $scope.$apply();
                                });
                            }
                            if (funCode == WITHDRAW && $scope.receiptChainId == piChainId) {
                                queryErc20PiInfoTXList($scope.account.address,piChainId).then(function(wdata) {
                                    $scope.transactionList = wdata.data;
                                    $scope.$apply();
                                });
                            }
                        }
                    });
                } else {
                    if (res.data.receipt.blockNumber != undefined && res.data.receipt.status == "0x0") {
                        var eobj = {};
                        eobj.ethContractId = 0;
                        eobj.piContractId = 0;
                        eobj.chainId = $scope.receiptChainId;
                        eobj.hash = res.data.receipt.transactionHash;
                        eobj.status= "0x4";
                        updateErc20PiInfo(eobj).then(function(errobj) {
                            if (errobj.result == "success") {
                                if (funCode == NEWCONTRACT && chainId == ethChainId) {
                                    queryErc20PiInfoTXList($scope.erc20account.address,ethChainId).then(function(robj) {
                                        $scope.transactionERC20List = robj.data;
                                        $scope.$apply();
                                    });
                                }
                                if (funCode == APPROVE && chainId == ethChainId) {
                                    queryErc20PiInfoTXList($scope.erc20account.address,ethChainId).then(function(robj) {
                                        $scope.transactionERC20List = robj.data;
                                        $scope.$apply();
                                    });
                                }
                                if (funCode == WITHDRAW && chainId == piChainId) {
                                    $scope.refundFlag = true;
                                    queryErc20PiInfoTXList($scope.account.address,piChainId).then(function(wdata) {
                                        $scope.transactionList = wdata.data;
                                        $scope.$apply();
                                    });
                                }
                            }
                        });
                    } else {
                        console.log("getReceipt , 当前数据hash还没打包进块！");
                    }
                }
            }, function errorCallback(res) {
                console.log(res);
                showPopup("Internet error, please refresh the page");
            });
        } catch (e) {
            console.log(e);
            showPopup("Internet error, please refresh the page");
        }
    }

     // $scope.sendTx = function() {
     //
     //     try {
     //         const gasPrice = $scope.gasPrice * Math.pow(10, 9);
     //         const amount = web3.toWei($scope.toAmount, "ether");
     //         let paramArr = [swapAddr,amount];
     //         var data = $scope.getPlayLoad(transferABI,"transfer",paramArr);
     //         var nonce = $scope.nonce;
     //         var signRawObj = initEthSignRawContract(nonce, gasPrice, $scope.gasLimit,contractAddress,data);
     //         var signData = signEthTx($scope.currentPrivateKey, signRawObj);
     //         $scope.currentPrivateKey = "";
     //
     //         var obj = {};
     //         obj.piAddress = $scope.account.address;
     //         obj.erc20Address = $scope.erc20account.address;
     //         obj.toAmount = $scope.toAmount;
     //         obj.signData = signData;
     //         obj.nonce = nonce;
     //         console.log(obj);
     //
     //         loading();
     //
     //         // var url = APIHost + "/sendErc20Tx";
     //
     //         var url = "http://localhost:3038/tokenSwapContracts";
     //         $http({
     //             method: 'POST',
     //             url: url,
     //             data: obj
     //         }).then(function successCallback(res) {
     //
     //             console.log("-----------------------", res);
     //             removeLoading();
     //             if (res.data.result == "success") {
     //                 showPopup("Token swap is in progress, please check the balance later, thank you", 8000);
     //                 $('#transaction').modal('hide');
     //                 var hash = res.data.data;
     //                 var url = "https://etherscan.io/tx/" + hash;
     //                 var html = 'Transaction hash:' + hash;
     //                 successNotify(html);
     //                 shell.openExternal(url);
     //                 var objt = {};
     //                 objt.hash = hash;
     //                 objt.type = 10;
     //                 objt.fromaddress = $scope.erc20account.address;
     //                 objt.toaddress = $scope.account.address;
     //                 objt.value=$scope.toAmount;
     //                 createTokenSwapInfo(objt).then(function(aobj) {
     //                     if (aobj.result == "success") {
     //                         queryTransactionChildList($scope.erc20account.address, 10).then(function(robj) {
     //                             console.log(robj.data)
     //                             $scope.transactionList = robj.data;
     //                             $scope.$apply();
     //                         })
     //                     }
     //                 })
     //             } else {
     //                 $('#transaction').modal('hide');
     //                 showPopup(res.data.error,5000);
     //             }
     //
     //         }, function errorCallback(res) {
     //             console.log(res);
     //             showPopup("Internet error, please refresh the page");
     //         });
     //
     //     } catch (e) {
     //         console.log(e);
     //         showPopup(e.toString());
     //     }
     //
     // }

    $scope.openExternal = function(hash) {
        shell.openExternal("https://ropsten.etherscan.io/tx/"+hash);
    }


    $scope.openExternalIntro = function() {
        shell.openExternal("https://pchaindoc.readthedocs.io/en/latest/introduction/tokenswap.html");
    }
     $scope.cutWords = function(words) {
         let result = words;
         if (words !=null && words.length > 12) {
             result = words.substr(0, 6) + "..." + words.substr(-6, 6);
         }
         return result;
     }


     $scope.keystorePath = "";
     $scope.keystoreJson;

     $scope.selectKeystore = function(){
         ipcRenderer.send('open-keystore-file');
     }

     ipcRenderer.on('selected-keystore',(event,path,fileJson)=>{
         if(fileJson.address && (fileJson.crypto || fileJson.Crypto) && fileJson.id){
             $scope.keystorePath = path;
             $scope.keystoreJson = fileJson;
             $scope.keystoreJson.address = "0x"+$scope.keystoreJson.address;
         }else{
             $scope.keystorePath = "";
             $scope.keystoreJson = "";
             showPopup("Error","Incorrect Format Keystore","error");
         }
         $scope.$apply();
     })

     $scope.importKeystoreFile = function(){
         const eWallet = require('ethereumjs-wallet');
         try{
             const keystoreInstance = eWallet.fromV3($scope.keystoreJson,$scope.keystorePassword);
             let newPrivateKey = keystoreInstance.getPrivateKey().toString("hex");
             var enPri = AESEncrypt(newPrivateKey,$scope.keystorePassword);
             $scope.keystorePassword = "";

             importErc20Account(enPri,$scope.keystoreJson.address).then(function (resObj) {
                 if(resObj.result=="success"){
                     showPopup("Import Keystore Successfully",1000);
                     $('#importKeystore').modal('hide');
                     $scope.keystoreJson = "";
                     $scope.keystorePath = "";
                     var obj = {};
                     obj.address = priToAddress(newPrivateKey);
                     $scope.erc20accountList.push(obj);

                     if($scope.erc20accountList.length> 0){
                         $scope.erc20account = $scope.erc20accountList[$scope.erc20accountList.length-1];
                     }
                     if(resObj.data){
                         $scope.accountList.push(obj);

                         if($scope.accountList.length> 0){
                             $scope.account = $scope.accountList[$scope.accountList.length-1];
                         }
                     }
                     $scope.getBalance();
                 }else{
                     showPopup(resObj.error,1000);
                 }
             }).catch(function (e) {
                 showPopup(e.error,1000);
             })
         }catch(e){
             console.log(e);
             swal("Import Error",e.toString(),"error");
         }
     }


     $scope.importPrivateKey = function(){

         var newPrivateKey = $scope.newPrivate;

         var obj = {};

         obj.address = priToAddress(newPrivateKey);

         var enPri = AESEncrypt(newPrivateKey,$scope.password2);
         $scope.password2 = "";
         $scope.repeatPassword2 = "";
         $scope.newPrivate = "";
         newPrivateKey = "";

         importErc20Account(enPri,obj.address).then(function (resObj) {
             if(resObj.result=="success"){
                 showPopup("Import Successfully",1000);
                 $('#importAccount').modal('hide');

                 $scope.erc20accountList.push(obj);

                 if($scope.erc20accountList.length> 0){
                     $scope.erc20account = $scope.erc20accountList[$scope.erc20accountList.length-1];
                 }
                if(resObj.data){
                    $scope.accountList.push(obj);

                    if($scope.accountList.length> 0){
                        $scope.account = $scope.accountList[$scope.accountList.length-1];
                    }
                }

                 $scope.getBalance();
             }
         }).catch(function (e) {
             showPopup(e.error,2000);
             $('#importAccount').modal('hide');
             $scope.password2 = "";
             $scope.repeatPassword2 = "";
             $scope.newPrivate = "";
         })

     }

     $scope.newPrivateKet = function() {
         var newAccount = Accounts.new();
         return newAccount.unCryp.private;
     }

     $scope.add = function() {

         var newPrivateKey = $scope.newPrivateKet();

         var obj = {};

         obj.address = priToAddress(newPrivateKey);

         $scope.accountList.push(obj);
         var enPri = AESEncrypt(newPrivateKey, $scope.password);
         addAccount(enPri, obj.address).then(function(resObj) {
             if (resObj.result == "success") {
                 showPopup("Created successfully", 1000);
                 $('#newAccount').modal('hide')

                 if ($scope.accountList.length > 0) {
                     $scope.account = $scope.accountList[$scope.accountList.length - 1];
                 }
                 $scope.getBalance();
             }
         }).catch(function(e) {
             console.log(e, "error");
         })
     }

 });
 $(function() {
     menuActive(10);
 });
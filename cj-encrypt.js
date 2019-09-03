;(function (undefined) {
    "use strict"
    var _global;
    // 保存明文防止勾取
    function SetPlaintext() {
        this.plaintext = '';
    }
    SetPlaintext.prototype.addData = function (value) {
        this.plaintext = this.plaintext + value;
    };
    SetPlaintext.prototype.deleteData = function () {
        this.plaintext = this.plaintext.slice(0, this.plaintext.length - 1);
    };
    SetPlaintext.prototype.initData = function () {
        this.plaintext = '';
    }
    var setplaintext = new SetPlaintext();
    //构造函数
    function cjEncrypt() {};
    cjEncrypt.prototype = {
        constructor: this,
        isShow: false,
        dataLength: 0,
        callback: {}, //回调函数
        keyType: 'pay-pwd', //默认支付密码
        isRandom: true, //默认随机
        isCheck: false, //默认不检查密码的安全检查
        inputDom: null,
        _iframDom: null,
        keyboardDom: null,
        // 绑定键盘
        keyBoardBind: function (opt) {
            var inputID = opt.id;
            this.keyType = opt.type;
            this.isRandom = opt.random;
            this.isCheck = opt.checked;
            this.setInput(inputID);
            this.bindClick(inputID);
        },
        // 创建dom
        createHtml: function (isRandom, keyType) {
            var inputValue = this.Helper.getkeyBoardRandom(isRandom),
                html = '';
            if (keyType != 'pay-pwd' && keyType != 'login-pwd') {
                console.error('type error!');
                return html;
            }
            html = '<div id="cj-keyboard-shade"></div><div id="cj-keyboard-wrapper" class="cj-keyboard-wrapper"><div id="cj-keyboard-title"><div id="cj-block1" class="cj-block"></div><div id="cj-block2" class="cj-block"></div><div id="cj-block3" class="cj-block"></div><div id="cj-block4" class="cj-block"></div><div id="cj-block5" class="cj-block"></div><div id="cj-block6" class="cj-block"></div></div>';
            html += '<div id="cj-keyboard-con1" class="cj-keyboard-con">';
            for (var i = 0; i < 3; i++) {
                html += '<button class="number number1" value="' + inputValue[i] + '">' + inputValue[i] + '</button>';
            }
            html += '</div><div id="cj-keyboard-con2" class="cj-keyboard-con">';
            for (var i = 3; i < 6; i++) {
                html += '<button class="number number1" value="' + inputValue[i] + '">' + inputValue[i] + '</button>';
            }
            html += '</div><div id="cj-keyboard-con3" class="cj-keyboard-con">';
            for (var i = 6; i < 9; i++) {
                html += '<button class="number number1" value="' + inputValue[i] + '">' + inputValue[i] + '</button>';
            }
            html += '</div><div id="cj-keyboard-con4" class="cj-keyboard-con"><button class="number btn btn-ok">确认</button><button class="number number1" value="' + inputValue[9] + '">' + inputValue[9] + '</button><button class="number btn btn-delete">删除</button></div></div>';
            return html;
        },
        // 初始化input只读
        setInput: function (id) {
            this.inputDom = document.getElementById(id);
            this.inputDom.setAttribute('readonly', true);
        },
        //input 绑定点击事件
        bindClick: function () {
            var _this = this;
            this.inputDom.onclick = function () {
                _this.show(_this.isShow);
            }
        },
        show: function (isShow) {
            var _this = this;
            if (!isShow) {
                var src = this.createHtml(this.isRandom, this.keyType);
                var dom = this.parseToDom(src);
                this._iframDom = dom[0], this.keyboardDom = dom[1];
                document.body.appendChild(this.keyboardDom);
                document.body.insertBefore(this._iframDom = dom[0], this.keyboardDom);
                this.isShow = true;
                this.setBlock();
                this._iframDom.onclick = function () {
                    _this.hide();
                    _this.isShow = false;
                }
                // 绑定按钮点击事件
                var buttons = this.keyboardDom.getElementsByClassName('number1');
                for (var i = 0; i < buttons.length; i++) {
                    buttons[i].onclick = function () {
                        if (_this.dataLength < 6) {
                            var value = this.getAttribute('value');
                            setplaintext.addData(value);
                            _this.dataLength = setplaintext.plaintext.length;
                            _this.setBlock(true);
                        }
                        if (_this.dataLength == 6) {
                            _this.onSure(_this.callback.sure, setplaintext.plaintext)
                        }
                    }
                }
                // 确认
                this.keyboardDom.getElementsByClassName('btn-ok')[0].onclick = function () {
                    if (_this.isShow) {
                        _this.onSure(_this.callback.sure,setplaintext.plaintext);
                    }
                }
                // 删除
                this.keyboardDom.getElementsByClassName('btn-delete')[0].onclick = function () {
                    if (_this.dataLength != 0 && _this.isShow) {
                        _this.onDelete(_this.callback.deleteFn);
                    }
                }

            }
        },
        // 填充块
        setBlock: function (flag) {
            var leng = setplaintext.plaintext.length;
            var _div = this.keyboardDom.getElementsByClassName('cj-block');
            if (flag === true) {
                _div[leng - 1].innerText = '●';
                this.inputDom.setAttribute('value', (this.inputDom.getAttribute('value') ? this.inputDom.getAttribute('value') : '') + '●');
            } else if (flag === false) {
                _div[leng].innerText = '';
                this.inputDom.setAttribute('value', this.inputDom.getAttribute('value').slice(0, this.inputDom.getAttribute('value').length - 1));
            } else {
                for (var i = 0; i < leng; i++) {
                    _div[i].innerText = '●';
                }
            }
        },
        hide: function () {
            document.body.removeChild(this._iframDom);
            document.body.removeChild(this.keyboardDom);
        },
        parseToDom: function (str) { // 将字符串转为dom
            var div = document.createElement('div');
            if (typeof str == 'string') {
                div.innerHTML = str;
            }
            return div.childNodes;
        },
        _parseTpl: function (tmpId) { // 将模板转为字符串
            var data = this.def;
            var tplStr = document.getElementById(tmpId).innerHTML.trim();
            return templateEngine(tplStr, data);
        },
        // 删除
        onDelete: function (callback) {
            this.callback.deleteFn = callback || '';
            if (this.isShow) {
                setplaintext.deleteData();
                this.setBlock(false);
                callback && callback({
                    data: setplaintext.plaintext
                });
            }
        },
        // 确认
        onSure: function (callback, data) {
            var obj = {
                isRandom: this.isRandom,
                isCheck: this.isCheck
            };
            if (this.isCheck) { //开启验证 判断密码是否过于简单
                if (this.Helper.checkPsd(data)) {
                    obj.isSafe = false;
                } else {
                    obj.isSafe = true;
                }
            }
            this.callback.sure = callback || '';
            if (this.isShow) {
                obj.cipher = setplaintext.plaintext;
                callback && callback(obj);
                this.hide();
                this.isShow = false;
            }
        },
        Helper: {
            //检查支付密码
            checkPsd: function (data) {
                var reg1 = /^(\d)\1{5}$/;
                var str = '0123456789_9876543210';
                if (reg1.test(data) || str.indexOf(data) > -1) {
                    return true;
                } else {
                    return false;
                }
            },
            // 键盘按钮随机
            getkeyBoardRandom: function (isRandom) {
                var arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
                if (isRandom) {
                    var arr1 = arr.sort(function () {
                        return Math.random() - 0.5;
                    })
                    return arr1;
                } else {
                    return arr;
                }
            },
            //获取随机数
            getRandomWord: function (n) {
                var str = "",
                    arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
                for (var i = 0; i < n; i++) {
                    var pos = Math.round(Math.random() * 15);
                    str += arr[pos];
                }
                return str;

            }
        }
    }
    // 最后将插件对象暴露给全局对象
    _global = (function () {
        return this || (0, eval)('this');
    }());
    if (typeof module !== "undefined" && module.exports) {
        module.exports = cjEncrypt;
    } else if (typeof define === "function" && define.amd) {
        define(function () {
            return cjEncrypt;
        });
    } else {
        !('cjEncrypt' in _global) && (_global.cjEncrypt = cjEncrypt);
    }
}())
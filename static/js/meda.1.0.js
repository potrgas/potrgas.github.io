/*
    @author: yaobo
    @vision: 1.1
    @update: 2015/05/20 10:50
 */
var MEDA = {};
MEDA.config = {
    vision: "1.0",
    index: 1200
};

/*
    �϶�
*/
MEDA.drag = function (options) {
    var defaults = {
        obj: "",             //�ϷŶ���
        handle: "",             //���ô������󣨲�������ʹ���ϷŶ���
        container: "",             //ָ��������������
        temp: false,          //�滻��
        limit: false,          //�Ƿ����÷�Χ����
        lockX: false,          //�Ƿ�����ˮƽ�����Ϸ�
        lockY: false,          //�Ƿ�������ֱ�����Ϸ�
        fixed: false,
        dragStart: function () { },   //��ʼ�ƶ�ʱִ��
        dragMove: function () { },   //�ƶ�ʱִ��
        dragStop: function () { }    //�����ƶ�ʱִ��
    };
    var settings = $.extend({}, defaults, options || {}),
        x = 0,
        y = 0,
        iTop = 0,
        iLeft = 0,
        drag = $(settings.obj),
        handle = settings.handle != "" ? $(settings.handle, drag) : drag,
        container = $(settings.container),
        temp = null,
        dragWidth = drag.width(),
        dragHeight = drag.height(),
        scrollW = 0,
        scrollH = 0,
        scrollL = 0,
        scrollT = 0,
        maxLeft = 0,
        maxTop = 0,
        maxRight = 9999,
        maxBottom = 9999,
        start = function (e) {
            e.stopPropagation();
            e.preventDefault();
            x = e.clientX - drag.get(0).offsetLeft;
            y = e.clientY - drag.get(0).offsetTop;
            iLeft = drag.get(0).offsetLeft;
            iTop = drag.get(0).offsetTop;
            MEDA.config.index++;
            //����margin
            drag.addClass("ui-drag-start").removeClass("ui-drag-move ui-drag-stop").css({
                left: iLeft + "px",
                top: iTop + "px",
                marginLeft: 0,
                marginTop: 0,
                zIndex: MEDA.config.index
            });
            $("html,body").addClass('ui-disable-select');
            //��ʼ�϶�ʱ�ٴ�������С
            dragWidth = drag.outerWidth();
            dragHeight = drag.outerHeight();
            //͸���ϷŶ���
            if (!!settings.temp) {
                drag.append('<div class="ui-drag-temp"></div>');
                temp = $(".ui-drag-temp", drag);
                temp.css({
                    width: dragWidth + "px",
                    height: dragHeight + "px"
                })
            }
            var index = drag.css("zIndex");
            var ui = { left: iLeft, top: iTop, width: dragWidth, height: dragHeight, index: index }
            if ($.isFunction(settings.dragStart)) settings.dragStart(ui);
        },
        move = function (e) {
            e.stopPropagation();
            e.preventDefault();
            MEDA.tool.clearSelect();
            iLeft = e.clientX - x;
            iTop = e.clientY - y;
            drag.addClass("ui-drag-move").removeClass("ui-drag-start ui-drag-stop");
            if (!!settings.limit) {
                //�������Զ�λʱ�����Ʒ�Χ
                if (!settings.fixed) {
                    scrollL = maxLeft = document.body.scrollLeft;
                    scrollT = maxTop = document.body.scrollTop;
                };
                //���÷�Χ����
                maxRight = (document.documentElement.clientWidth || document.body.clientWidth) + scrollL;
                maxBottom = (document.documentElement.clientHeight || document.body.clientHeight) + scrollT;
                //�����������������������Χ����
                if (!!settings.container) {
                    //�����߿�border
                    var css = MEDA.tool.getStyle(container.get(0)),
                        bdleftright = (parseInt(css['border-left-width']) + parseInt(css['border-right-width'])),
                        bdtopbottom = (parseInt(css['border-top-width']) + parseInt(css['border-bottom-width']));
                    if (container.get(0).scrollWidth > container.width()) {
                        maxRight = container.get(0).offsetWidth - bdleftright;
                        scrollH = 15;
                    } else {
                        maxRight = container.width();
                    }
                    if (container.get(0).scrollHeight > container.height()) {
                        maxBottom = container.get(0).offsetHeight - bdtopbottom;
                        scrollW = 15;
                    } else {
                        maxBottom = container.height();
                    }
                };
                //�����ƶ�����
                iLeft = Math.max(Math.min(iLeft, maxRight - dragWidth), maxLeft);
                iTop = Math.max(Math.min(iTop, maxBottom - dragHeight), maxTop);
            };

            if (!!settings.temp) {
                if (!settings.lockX) { temp.css("left", (iLeft - drag.get(0).offsetLeft) + "px") }
                if (!settings.lockY) { temp.css("top", (iTop - drag.get(0).offsetTop) + "px") }
            } else {
                if (!settings.lockX) { drag.css("left", iLeft + "px") }
                if (!settings.lockY) { drag.css("top", iTop + "px") }
            }
            var index = drag.css("zIndex");
            var ui = { left: iLeft, top: iTop, width: dragWidth, height: dragHeight, index: index }
            if ($.isFunction(settings.dragMove)) settings.dragMove(ui);
        },
        end = function (e) {
            e.stopPropagation();
            e.preventDefault();
            $(document).unbind("mousemove");
            $(document).unbind("mouseup");
            drag.addClass("ui-drag-stop").removeClass("ui-drag-start ui-drag-move");
            if (!!settings.temp) temp.remove();
            if (!settings.lockX) { drag.css("left", iLeft + "px") }
            if (!settings.lockY) { drag.css("top", iTop + "px") }
            var index = drag.css("zIndex");
            var ui = { left: iLeft, top: iTop, width: dragWidth, height: dragHeight, index: index }
            if ($.isFunction(settings.dragStop)) settings.dragStop(ui);
            $("html,body").removeClass('ui-disable-select');
        };
    handle.on("mousedown", function (e) {
        start(e);
        //ֻ�����������϶�
        if (e.button == 2) return;
        if (MEDA.tool.browser.isIE) {
            drag.setCapture();
        } else {
            window.captureEvents(Event.MOUSEMOVE);
        }
        $(document).on("mousemove", function (e) { move(e); });
        $(document).on("mouseup", function (e) { end(e); });
    }).mouseover(function (event) {
        $(this).css("cursor", "move");
    });
};



var ui = {
    //��λ
    setPosition: function (object, position, reference) {
        var refer = reference || document,
            isGlobal = (refer == document || refer == window) ? 1 : 0;

        var objWidth = object.outerWidth(),
            objHeight = object.outerHeight();

        var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;

        var pos = position.split(","),
             xPos = pos[0],
             yPos = pos[1] || pos[0],
             oPos = isGlobal ? pos[2] : "absolute",
             x = isGlobal ? 0 : $(refer).offset().left,
             y = oPos == "fixed" ? 0 : isGlobal ? scrollTop : $(refer).offset().top;
        object.css({ position: oPos });

        switch (xPos) {
            case "center":
                object.css({
                    left: ($(refer).width() - objWidth) / 2 + x,
                    right: "auto"
                });
                break;
            case "left":
                object.css({
                    left: x,
                    right: "auto"
                });
                break;
            case "right":
                if (isGlobal) {
                    object.css({
                        left: "auto",
                        right: 0
                    });
                } else {
                    object.css({
                        left: x + $(refer).outerWidth() - objWidth,
                        right: "auto"
                    });
                }
                break;
            default:
                break;
        }
        switch (yPos) {
            case "center":
                var n = isGlobal ? 2.5 : 2;
                var top = refer == document ? (($(window).height() - objHeight) / n + y) : (($(refer).height() - objHeight) / n + y);
                top = (refer == document && top < 0) ? 0 : top;
                object.css({
                    top: top,
                    bottom: "auto"
                });
                break;
            case "top":
                object.css({
                    top: y - objHeight,
                    bottom: "auto"
                });
                break;
            case "bottom":
                if (isGlobal) {
                    object.css({
                        top: "auto",
                        bottom: 0
                    });
                } else {
                    object.css({
                        top: y + $(refer).outerHeight(),
                        bottom: "auto"
                    });
                }
                break;
            default:
                break;
        }
    },
    //չʾЧ��
    showEffect: function (options) {
        var defaults = {
            panel: "",
            reference: "",
            speed: 300,
            effect: "fade", //[fade, fadeDown, slide, sacle, move]
            callback: function () { }
        },
        o = $.extend(defaults, options);
        switch (o.effect) {
            case "fade":
                o.panel.hide().fadeIn(o.speed, function () {
                    if (o.callback && $.isFunction(o.callback)) {
                        o.callback(o.panel);
                    }
                });
                break;
            case "fadeDown":
                var top = parseInt(o.panel.css("top"));
                o.panel.css({
                    "opacity": 0.5,
                    "top": top - 20
                });
                o.panel.stop().show().animate({
                    "opacity": 1,
                    "top": top
                }, o.speed, function () {
                    if (o.callback && $.isFunction(o.callback)) {
                        o.callback(o.panel);
                    }
                });
                break;
            case "slideDown":
            case "slideUp":
                var height = o.panel.height();
                var top = parseInt(o.panel.css("top"));
                var over = o.panel.css("overflow");
                o.panel.css({
                    "display": "none",
                    "height": 0,
                    "overflow": "hidden",
                    "top": (o.effect == "slideUp") ? top : top + height
                });
                o.panel.stop().show().animate({
                    "height": height,
                    "top": top
                }, o.speed, function () {
                    o.panel.css({
                        "overflow": over
                    });
                    if (o.callback && $.isFunction(o.callback)) {
                        o.callback(o.panel);
                    }
                });
                break;
            case "sacle":
                var percent = 0.8;
                var height = o.panel.height();
                var width = o.panel.width();
                var top = parseInt(o.panel.css("top"));
                var left = parseInt(o.panel.css("left"));
                var over = o.panel.css("overflow");
                o.panel.css({
                    "display": "none",
                    "height": height * percent,
                    "width": width * percent,
                    "opacity": 0,
                    "overflow": "hidden",
                    "top": top + height * (1 - percent) / 2,
                    "left": left + width * (1 - percent) / 2
                });
                o.panel.show().animate({
                    "opacity": 1,
                    "height": height,
                    "left": left,
                    "top": top,
                    "width": width
                }, o.speed, function () {
                    o.panel.css({
                        "overflow": over
                    });
                    if (o.callback && $.isFunction(o.callback)) {
                        o.callback(o.panel);
                    }
                });
                break;
            case "move":
                var sleft, stop, swidth, sheight, eleft, etop, ewidth, eheight;
                swidth = o.reference.outerWidth();
                sheight = o.reference.outerHeight();
                sleft = o.reference.offset().left;
                stop = o.reference.offset().top;
                ewidth = o.panel.outerHeight();
                eheight = o.panel.outerHeight();
                eleft = parseInt(o.panel.css("left"));
                etop = parseInt(o.panel.css("top"));
                var _tempDiv = $("<div class='pop_temp_div'></div>");
                var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
                _tempDiv.appendTo('body');
                _tempDiv.css({
                    "position": "absolute",
                    "left": sleft + "px",
                    "top": stop + scrollTop + "px",
                    "width": swidth + "px",
                    "height": sheight + "px",
                    "background": "#fff",
                    "opacity": "0.1",
                    "zIndex": "100"
                }).stop().animate({
                    "left": eleft + "px",
                    "top": etop + scrollTop + "px",
                    "width": ewidth + "px",
                    "height": eheight + "px",
                    "opacity": "0.8"
                }, o.speed, function () {
                    _tempDiv.remove();
                    o.panel.show();
                    if (o.callback && $.isFunction(o.callback)) {
                        o.callback(o.panel);
                    }
                });
                break;
        }
    },
    //չʾЧ��
    hideEffect: function (panel, effect, callback) {
        //���õ�����ʽ
        var speed = 300;
        switch (effect) {
            case "fade":
                panel.fadeOut(speed, function () {
                    if (typeof (callback) === 'function') callback();
                });
                break;
            case "fadeDown":
                var top = parseInt(panel.css("top"));
                panel.stop().animate({
                    opacity: 0.5,
                    top: top + 20
                }, speed, function () {
                    panel.hide();
                    if (typeof (callback) === 'function') callback();
                });
                break;
            case "slide":
                var height = panel.height();
                var top = parseInt(panel.css("top"));
                panel.stop().animate({
                    height: 0,
                    top: top + height
                }, speed, function () {
                    panel.hide();
                    panel.css({
                        height: height,
                        top: top
                    })
                    if (typeof (callback) === 'function') callback();
                });
                break;
            default:
                panel.hide();
                break;
        }
    },
    //  ��ȡҳ���С�����Ϣ
    getPageSize: function () {
        var a = MEDA.tool.browser.isStrict ? document.documentElement : document.body;
        var b = ["clientWidth", "clientHeight", "scrollWidth", "scrollHeight"];
        var c = {};
        for (var d in b) c[b[d]] = a[b[d]];
        c.scrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft;
        c.scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
        return c
    },
    /*
    ��ȡDOMλ����Ϣ�����������ĵ���λ�ã�
    node        ����
    2011��5��20��17:01
*/
    getPosition: function (node) {
        var left = 0, top = 0, right = 0, bottom = 0;
        var ps = ui.getPageSize();
        //ie8��getBoundingClientRect��ȡ��׼ȷ
        if (!node.getBoundingClientRect || MEDA.tool.browser.isIE8) {
            var n = node;
            while (n) { left += n.offsetLeft, top += n.offsetTop; n = n.offsetParent; };
            right = ps.clientWidth - left - node.offsetWidth; bottom = ps.clientHeight - top - node.offsetHeight;
        } else {
            var rect = node.getBoundingClientRect();
            left = right = ps.scrollLeft;
            top = bottom = ps.scrollTop;
            left += rect.left;
            right += ps.clientWidth - rect.right;
            top += rect.top;
            bottom += ps.clientHeight - rect.bottom;
        };
        return { "left": left, "top": top, "right": right, "bottom": bottom };
    }
}

var pop = {};

pop.template = {
    mask: '<div id="pop_mask" class="meda-mask"></div>',//mask: '<div id="pop_mask" class="meda-mask"><span class="meda-close">x</span></div>',
    state: '<div id="pop-state" class="ui-dialog fadeInDown ui-drag-start">\
            <div class="ui-dialog-content">\
                <i class="success" id="pop-state-img"></i><div class="title_msg"><div class="js-title"></div></div>\
                <div class="clearfix"></div>\
            </div>\
          </div>',

    dialog: '<div id="{id}" data-active="true" class="ui-dialog"><span class="ui-close ui-close-dialog icon-clear js-dialog-close"></span>\
        <div class="ui-dialog-title js-drag"><span class="ui-dialog-title-text">{title}</span></div>\
        <div class="ui-dialog-content ui-dialog-padding">{content}</div></div>',

    confirm: '<div id="pop-confirm"  class="ui-dialog">\
        <div class="ui-dialog-content">\
            <i></i><div class="title_msg"><div class="js-confirm-title"></div></div>\
            <div class="clearfix"></div>\
        </div>\
        <div class="ui-dialog-button-wrap">\
            <button class="ui-dialog-button ui-dialog-butto-yes js-btn-sure">ȷ��</button>\
            <button class="ui-dialog-button ui-dialog-butto-no js-btn-no">ȡ��</button></div>\
        </div>'
}

pop.node = {
    mask: function () { return $("#pop_mask").length == 0 ? "pop_mask" : $("#pop_mask"); },
    state: function () { return $("#pop-state").length == 0 ? "pop-state" : $("#pop-state"); },
    confirm: function () { return $("#pop-confirm").length == 0 ? "pop-confirm" : $("#pop-confirm"); }
},

pop.init = function () {
    var _document = document.compatMode == "CSS1Compat" ? document.documentElement : document.body;
    var bodyHeight = _document.scrollHeight;
    //���ֲ�
    var mask = $(pop.template.mask).css({
        position: 'absolute',
        left: 0,
        top: 0,
        display: 'none',
        width: '100%',
        height: bodyHeight + "px"
    });

    //״̬��
    var state = $(pop.template.state);

    //ȷ����
    var confirm = $(pop.template.confirm);

    $("body").append(mask)
                   .append(state)
                   .append(confirm);

    mask.hide();
    state.hide();
    confirm.hide();
}

//���ֲ�
pop.mask = {
    show: function () {
        var mask = pop.node.mask();
        var height = Math.max($(document).height(), $(window).height());
        mask.css({ height: height, display: "block" });
        return mask;
    },
    hide: function () {
        var mask = pop.node.mask();
        mask.hide();
    }
}

///����״̬��
pop.state = function (opts) {

    clearTimeout(arguments.callee.timer);

    var setting = {
        title: '',
        type: 1,
        refer: null,
        mask: false,
        effect: '',
        callback: null,
        outTime: 2500
    };

    if (opts != undefined) setting = $.extend(setting, opts);

    var pop_state = pop.node.state();

    if (typeof (pop_state) == 'string') $("body").append($(pop.template.state).attr("id", pop_state));

    pop_state.find(".js-title").text(setting.title);


    //��ʽ
    var type_cls = '';
    switch (setting.type) {
        case 0:
            type_cls = "error";
            break;
        case 1:
            type_cls = "success";
            break;
        case 2:
            type_cls = "warning";
            break;

    }
    pop_state.find("#pop-state-img").removeClass().addClass(type_cls);
    pop_state.removeAttr("style").hide();

    //���ֲ�
    if (setting.mask) pop.mask.show();

    if (setting.effect == '') setting.effect = "fade";

    var pos = 'center,center,fixed';
    if (setting.effect == "slide") pos = "center,top,fixed";

    //��ʾ
    if (setting.refer) {
        ui.setPosition(pop_state, pos, setting.refer);
        ui.showEffect({ panel: pop_state, effect: setting.effect });
    }
    else {
        ui.setPosition(pop_state, pos);
        ui.showEffect({ panel: pop_state, effect: setting.effect });
    }

    //����
    arguments.callee.timer = setTimeout(function () {
        ui.hideEffect(pop_state, setting.effect, setting.callback);
        if (setting.mask) pop.mask.hide();
    }, setting.outTime);
}


//ȷ�Ͽ�
pop.confirm = function (opts) {

    var setting = {
        title: '',
        refer: '',
        mask: 0,
        effect: '',
        callback: '',
        pos: ''
    };

    if (opts != undefined) setting = $.extend(setting, opts);

    var pop_confirm = pop.node.confirm();

    if (typeof (pop_confirm) == 'string') $("body").append($(pop.tpl.confirm).attr("id", pop_confirm));

    //����
    pop_confirm.find(".js-confirm-title").text(setting.title);

    //ȷ��
    pop_confirm.find(".js-btn-sure").unbind("click").bind("click", function () {
        if (setting.refer) setting.callback(setting.refer);
        pop_confirm.find(".js-btn-no").click();
    });

    //ȡ��
    pop_confirm.find(".js-btn-no").unbind("click").bind("click", function () {
        var confirm = pop.node.confirm();
        ui.hideEffect(confirm, "slide");
    });

    //���ֲ�
    if (setting.mask) pop.mask.show();

    //��ʾ
    if (setting.refer) {
        var pos = "center,top";
        if (setting.pos) pos = setting.pos;
        ui.setPosition(pop_confirm, pos, setting.refer);
        ui.showEffect({
            panel: pop_confirm,
            effect: "slideDown"
        });
    }
    else ui.showEffect({ panel: pop_confirm, effect: "slideDown" });
}


///������
pop.dialog = function (opts) {

    var setting = {
        id: '',
        drag: false,
        title: '',
        mask: true,
        effect: 'fadeDown',
        content: '',
        callback: null,
        initComplete: null,
        hiddenComplete: null
    };

    if (opts != undefined) setting = $.extend(setting, opts);

    var pop_dialog = $("#" + setting.id);

    if (pop_dialog.length == 0) {
        var html = MEDA.tool.tmpl(pop.template.dialog, { 'id': setting.id, 'title': setting.title, 'content': setting.content });
        var $form = $(html);
        $("body").append($form); $form.hide(); pop_dialog = $("#" + setting.id);
    }

    //�϶�
    if (setting.drag) MEDA.drag({ obj: "#" + setting.id, temp: true, handle: ".js-drag" });

    //ȡ��
    pop_dialog.find(".js-dialog-close").unbind("click").bind("click", function () {
        ui.hideEffect(pop_dialog, "fadeDown", function () {
            pop_dialog.remove();
            pop.mask.hide();
            if ($.isFunction(setting.hiddenComplete)) setting.hiddenComplete();
        });
    });

    //���ֲ�
    if (setting.mask) pop.mask.show();

    ui.setPosition(pop_dialog, "center,center,fixed");

    if (!MEDA.tool.browser.isIE) {
        $(window).resize(function () { ui.setPosition(pop_dialog, "center,center,fixed"); });
    }

    //����
    ui.showEffect({
        panel: pop_dialog,
        effect: setting.effect,
        callback: function () {
            if ($.isFunction(setting.callback)) setting.callback(pop_dialog);
            if ($.isFunction(setting.initComplete)) setting.initComplete();
        }
    });
    //���Ҹ���ҳ�����
    var _iframe = pop_dialog.find("iframe");
    if (_iframe.length) _iframe.bind("mousewheel", function () { return false; });
}

//�رյ�����
pop.dialog.close = function (id) {
    var $dialog;
    var $mask;
    if (window.frameElement != null) {
        $dialog = $(window.parent.document).find("#" + id);
        $mask = $(window.parent.document).find("#pop_mask");
        if ($dialog.length == 0) return;
    }
    else {
        $dialog = $("#" + id);
        $mask = $(pop.mask);
        if ($dialog.length == 0) return;
    }
    ui.hideEffect($dialog, "fadeDown", function () {
        $dialog.remove();
        console.log($mask);
        if ($mask.length != 0) $mask.hide();
    });
}

/*
    ʱ��������
    +++++++++++++++++++++++
    ����ʱ���ʽ��
    ��ǰ����ʱ��
    ����ʱ��ؼ�
    ����ʱ���
    ũ��
*/
MEDA.date = {
    /*��ʽ������ʱ��
    "yyyy-MM-dd hh:mm:ss.S"     ==> 2006-07-02 08:09:04.423
    "yyyy-MM-dd E HH:mm:ss"     ==> 2009-03-10 �� 20:09:04
    "yyyy-MM-dd EE hh:mm:ss"    ==> 2009-03-10 �ܶ� 08:09:04
    "yyyy-MM-dd EEE hh:mm:ss"   ==> 2009-03-10 ���ڶ� 08:09:04
    "yyyy-M-d h:m:s.S"          ==> 2006-7-2 8:9:4.18*/
    format: function (date, str) {
        var o = {
            "M+": date.getMonth() + 1,
            //�·�
            "d+": date.getDate(),
            //��
            "h+": date.getHours() % 12 == 0 ? 12 : date.getHours() % 12,
            //Сʱ
            "H+": date.getHours(),
            //Сʱ
            "m+": date.getMinutes(),
            //��
            "s+": date.getSeconds(),
            //��
            "q+": Math.floor((date.getMonth() + 3) / 3),
            //����
            "S": date.getMilliseconds() //����
        };
        var week = { "0": "\u65e5", "1": "\u4e00", "2": "\u4e8c", "3": "\u4e09", "4": "\u56db", "5": "\u4e94", "6": "\u516d" };
        if (/(y+)/.test(str)) {
            str = str.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        };
        if (/(E+)/.test(str)) {
            str = str.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "\u661f\u671f" : "\u5468") : "") + week[date.getDay() + ""]);
        };
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(str)) {
                str = str.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            };
        };
        return str;
    },
    /*
        ʱ���
        @t1&t2       ʱ��(2011-09-28 12:25:35)
    */
    timediff: function (t1, t2) {
        var s = 1000, m = s * 60, h = m * 60, d = h * 24, y = d * 30, t = d * 365;
        var time1 = new Date(Date.parse(t1)).getTime(),
        time2 = !t2 ? new Date().getTime() : new Date(Date.parse(t2)).getTime();
        var echotime, resultTime = time2 - time1;
        //console.log(time1, time2, resultTime);
        if (resultTime > y * 12) {
            echotime = "\u66F4\u4E45\u524D"; //����ǰ
        } else if (resultTime > y * 6) {
            echotime = "\u534A\u5E74\u524D"; //����ǰ
        } else if (resultTime > y * 3) {
            echotime = "3\u4E2A\u6708\u524D"; //3����ǰ
        } else if (resultTime > y * 2) {
            echotime = "2\u4E2A\u6708\u524D"; //2����ǰ
        } else if (resultTime > y) {
            echotime = "1\u4E2A\u6708\u524D"; //1����ǰ
        } else if (resultTime > d * 7) {
            echotime = "1\u5468\u524D"; //1��ǰ
        } else if (resultTime > d) {
            echotime = (Math.floor(resultTime / d) + "\u5929\u524D"); //��ǰ
        } else if (resultTime > h) {
            echotime = (Math.floor(resultTime / h) + "\u5C0F\u65F6\u524D"); //Сʱǰ
        } else if (resultTime > m) {
            echotime = (Math.floor(resultTime / m) + "\u5206\u949F\u524D"); //����ǰ
        } else if (resultTime > s) {
            echotime = (Math.floor(resultTime / s) + "\u79D2\u524D"); //��ǰ
        } else {
            echotime = (resultTime + "?Error");
        }
        return { time: resultTime, text: echotime };
    }
};

/*
    ���߿� v1.0
*/
MEDA.tool = {
    /*
        �ж� a , b ��Ԫ���Ƿ��а�����ϵ
        a       Ҫ��ѯ�Ķ���
        b       ��ǰ����Ķ���
    */
    contains: function (a, b) {
        if (a) return document.defaultView ? !!(a.compareDocumentPosition(b) & 16) : a != b && a.contains(b);
    },

    //��ȡ��ǰ��ʽ
    getStyle: function (element) {
        return element.currentStyle || document.defaultView.getComputedStyle(element, null);
    },

    // ����ı�ѡ��
    clearSelect: function () {
        try {
            window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
        } catch (_) { };
    },

    //��ȡ�ַ������Ⱥ����������ַ�
    gerStrLen: function (str) {
        if (str == null) return 0;
        if (typeof str != "string") str += "";
        return str.replace(/[^x00-xff]/g, "01").length;
    },

    //��ȡurl ����ֵ
    urlParams: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    },

    //ģ��
    tmpl: function (str, obj) {
        if (!(Object.prototype.toString.call(str) === '[object String]')) return '';
        if (!(Object.prototype.toString.call(obj) === '[object Object]' && 'isPrototypeOf' in obj)) return str;
        return str.replace(/\{([^{}]+)\}/g, function (match, key) {
            var value = obj[key];
            return (value !== undefined) ? '' + value : '';
        });
    },

    /*
        �ж���������汾
        2011��5��20�� 17:01
    */
    browser: function () {
        var a = navigator.userAgent.toLowerCase();
        var u = navigator.userAgent, app = navigator.appVersion;
        var b = {};
        b.isTrident = u.indexOf('Trident') > -1; //IE�ں�
        b.isPresto = u.indexOf('Presto') > -1; //opera�ں�
        b.isWebKit = u.indexOf('AppleWebKit') > -1; //ƻ�����ȸ��ں�
        b.isGecko = u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1; //����ں�
        b.isMobile = !!u.match(/AppleWebKit.*Mobile.*/); //�Ƿ�Ϊ�ƶ��ն�
        b.isIos = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios�ն�
        b.isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //android�ն˻�uc�����
        b.isIPhone = u.indexOf('iPhone') > -1; //�Ƿ�ΪiPhone����QQHD�����
        b.isIPad = u.indexOf('iPad') > -1; //�Ƿ�iPad
        b.isStrict = document.compatMode == "CSS1Compat";
        b.isFirefox = a.indexOf("firefox") > -1;
        b.isOpera = a.indexOf("opera") > -1;
        b.isChrome = a.indexOf("chrome") > -1;
        b.isSafari = (/webkit|khtml/).test(a);
        b.isSafari3 = b.isSafari && a.indexOf("webkit/5") != -1;
        b.isIE = !b.isOpera && a.indexOf("msie") > -1;
        b.isIE6 = !b.isOpera && a.indexOf("msie 6") > -1;
        b.isIE7 = !b.isOpera && a.indexOf("msie 7") > -1;
        b.isIE8 = !b.isOpera && a.indexOf("msie 8") > -1;
        b.isGecko = !b.isSafari && a.indexOf("gecko") > -1;
        b.isMozilla = document.all != undefined && document.getElementById != undefined && !window.opera != undefined;
        return b
    }(),

    /*
        ��ȡ����ַ�
        length      ����
        upper       �Ƿ������д��ĸ
        lower       �Ƿ�����Сд��ĸ
        number  �Ƿ���������
        2011��9��30�� 16:40:52
    */
    random: function (length, upper, lower, number) {
        if (!upper && !lower && !number) {
            upper = lower = number = true;
        }
        var a = [
            ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
            ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
            ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
        ];
        //��ʱ����
        var b = [];
        //��ʱ�ִ�
        var c = "";
        b = upper ? b.concat(a[0]) : b;
        b = lower ? b.concat(a[1]) : b;
        b = number ? b.concat(a[2]) : b;
        for (var i = 0; i < length; i++) {
            c += b[Math.round(Math.random() * (b.length - 1))];
        }
        return c;
    }
};

/*
    ����ԭ����չ
*/
Array.prototype.min = function () {
    return Math.min.apply({}, this);
};
Array.prototype.max = function () {
    return Math.max.apply({}, this);
};
Array.prototype.indexOf = function (val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    };
    return -1;
};
Array.prototype.remove = function (val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    };
};
Array.prototype.unique = function () {
    var a = this.concat();
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j])
                a.splice(j, 1);
        }
    }
    return a;
};
Array.prototype.shuffle = function () {
    for (var j, x, i = this.length; i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
    return this;
};

/*
    @ jQuery Mousewheel
    @ Version: 3.0.6
 */
(function (a) {
    function d(b) {
        var c = b || window.event,
            d = [].slice.call(arguments, 1),
            e = 0,
            f = !0,
            g = 0,
            h = 0;
        return b = a.event.fix(c), b.type = "mousewheel", c.wheelDelta && (e = c.wheelDelta / 120),
            c.detail && (e = -c.detail / 3), h = e, c.axis !== undefined && c.axis === c.HORIZONTAL_AXIS && (h = 0,
                g = -1 * e), c.wheelDeltaY !== undefined && (h = c.wheelDeltaY / 120), c.wheelDeltaX !== undefined && (g = -1 * c.wheelDeltaX / 120),
            d.unshift(b, e, g, h), (a.event.dispatch || a.event.handle).apply(this, d);
    }
    var b = ["DOMMouseScroll", "mousewheel"];
    if (a.event.fixHooks)
        for (var c = b.length; c;) a.event.fixHooks[b[--c]] = a.event.mouseHooks;
    a.event.special.mousewheel = {
        setup: function () {
            if (this.addEventListener)
                for (var a = b.length; a;) this.addEventListener(b[--a], d, !1);
            else this.onmousewheel = d;
        },
        teardown: function () {
            if (this.removeEventListener)
                for (var a = b.length; a;) this.removeEventListener(b[--a], d, !1);
            else this.onmousewheel = null;
        }
    }, a.fn.extend({
        mousewheel: function (a) {
            return a ? this.bind("mousewheel", a) : this.trigger("mousewheel");
        },
        unmousewheel: function (a) {
            return this.unbind("mousewheel", a);
        }
    });
})(jQuery);

/*
 HTML5 Support
*/
(function () {
    if (! /*@cc_on!@*/ 0) return;
    var e = "abbr,article,aside,audio,bb,canvas,datagrid,datalist,details,dialog,eventsource,figure,footer,header,hgroup,mark,menu,meter,nav,output,progress,section,time,video".split(','),
        i = e.length;
    while (i--) {
        document.createElement(e[i])
    }
})();

$(function () { pop.init(); });
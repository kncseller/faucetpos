var matchs = new RegExp("v1\/([0-9a-z]+)\/([^\/\?]+)\/(.*)", "g").exec(document.location.pathname);
var appconfig={
     
       shop_id :"",
      type: "ban-hang",
      id_outlet: "0",
      id_pos: "",
      domain:"https://acuamientay.click/",
};
var CURRENCY = "đ";
window.AppRequest = (function(win){
 
      var shop_id = appconfig.shop_id;
      var type = appconfig.type;
      var id_outlet = appconfig.id_outlet;
      var id_pos = appconfig.id_pos;
      return {
         post : function(url,data,f){
             data = data||{};
             data = this.beforeSend(data);

             post(url,data,f,true);
             return this;
         },
         beforeSend : function(data){
           data.shop_id =  shop_id;
           data.id_outlet = id_outlet;
           data.id_pos = this.id_pos || AppConfig.id_pos;
           return data;
         },
        fullscreen: function () {

            var elem = document.getElementById("appin");

            if (elem.requestFullscreen) {

              elem.requestFullscreen();

            } else if (elem.webkitRequestFullscreen) { 

              elem.webkitRequestFullscreen();

            } else if (elem.msRequestFullscreen) { 

              elem.msRequestFullscreen();

            }

          },
        pr : function(f){
          site_url_ajax("api/setting/pr/").post(function(res){
            if(typeof res=="object"){ 
              //override
              window.AppConfig = $.extend(window.AppConfig||{},res,true);

              if(f)f();
            }
            
         });

        },

        shop_id:shop_id,
        id_outlet:id_outlet,
        type:type,
        path : function(url){
            var a = this.shop_id.split("");
            var p = a.splice(0,4).join("")+"-"+a.slice(0,2).join("")+"-"+a.slice(0,2).join("");
            return site_url((AppConfig.token?AppConfig.token+"/":"")+p+"/"+(url||""));
        },
        id_pos:id_pos, //tram pos in outlet
        changeOutlet : function(){
           //now open select picker
          "ManageOutlet".navigate();
        },
        config : function(f){
           if(window.AppConfig){
             f(window.AppConfig);
           }else{
             setTimeout(function(){
                 window.AppRequest.config(f);
             },1500);
           }
        },
        logout : function(){
           this.shop_id =null;
           this.id_outlet =null;
           window.AppConfig ={};
           storage("config","");
           document.location.reload();
           return this;
        },
        login : function(data){
            "Login".navigate(data);
           return this;
        },
        ping : function(f){
            //ping heart beat
            site_url_ajax("api/storepos/ping/").post({},function(r){ }); 
            return this;   
        },
        heartbeat : function(f){
            //ping heart beat
            post(site_url_ajax("api/admin/ping"),{},function(r){
                 console.log(r);
                 $(".adminnotices").remove();
                 if(r.notices && r.notices.length){
                   $("body").append(`<div class='adminnotices'>
                      ${JSON.stringify(r.notices)}
                    </div>`);
                 }
                 //logout
                 if(r.logout==1){
                    document.location.reload()
                 }

                 $(document).trigger("Ping",[r]);
              },true); 
            return this;   
        },
        logo : function(f){
            var logo = "images/logo.png?t=1";
            if(window.AppConfig && AppConfig.setting.pr){
                logo = AppConfig.setting.pr?AppConfig.setting.pr.logo:"images/logo.png?t=1";
                window.localStorage.setItem("_logo",logo);
                return logo;
            } 
            logo = window.localStorage.getItem("_logo")|| logo; 
            return logo;
        },
        loadRoute: function(name,options){

              
           post("/view/"+name,{},function(r){
               if(r.code){
                // console.log(r);
                 //css,js,html
                 $("body").append(`<style id="123">${r.css}</style> <script id="1234">${r.js}<\/script>`);

                 //append menu to ui
                 $(".tabsmenu.tab").append(r.menu.map(function(v){
                   return `<li data-target="${v.id}"> ${v.icon.includes("https:")?`<img src="${v.icon}" width="24" height="24" />`:v.icon} <span>${v.name} </span> </li>`;
                 }).join(""));
               }
            },true);
        },
        loadRole : function(f){
            var config = win.AppConfig;

         

          if(win.user){

             
            $.blockUI({message:`<div style="text-align:center;"><div><img width="45" src="https://cdn-icons-png.flaticon.com/128/2859/2859277.png" /></div><p>Đang tải các module cần thiết. Vui lòng chờ trong giây lát...</p></div>`});

            $(document).on("Modules_Ready",function(e){
                //for dev loader
                var host = document.location.host;
                if(!host){
                    //is file access
                    var a = document.location.pathname.split("/");
                    a.pop();
                    var dir = "file://"+a.join("/");
                    LoadJS(dir+"/build/core.min.js",function(){});
                    LoadCSS(dir+"/build/core.min.css",function(){});
                }else if(!document.baseURI.includes(host)){
                    //is other domain access 
                     var a = document.location.pathname.split("/");
                    a.pop();
                    var dir = document.location.origin+"/"+a.join("/");
                    LoadJS(dir+"/build/core.min.js",function(){});
                    LoadCSS(dir+"/build/core.min.css",function(){});
                }
            });
            
       
          // if(load)return;
          //load role admin page
            post(site_url_ajax(AppRequest.BUILDDEV?"api/admin/debug/":"api/admin/role/"),{cached:0},function(r){
              $.unblockUI();

               if(r.code){
              

                 if( win.user.role=="admin"){

                  
                  // $(".managepage").show().find("a").attr("href",`https://f7.donggiatri.com/users/demo/pos/dist/?shop_id=${AppConfig.shop_id}&passkey=${window.user.passkey}`);
                  $(".listproduts").addClass("tools");

                  
                }
             

                // console.log(r);
                 //css,js,html
                 $("body").append(`<style id="css${Date.now()}">${r.css}</style> <script id="js${Date.now()}">${r.js}<\/script>`);
                 //trigger for all excute
                 $(document).trigger("onModule",[]);

                 //append menu to ui and append to group
                 r.menu.map(function(v){
                    if(v.display==1){
                    var group = v.group||"other";
                    $("[data-group='"+group+"']").append(`<li data-module="${v.module||''}" data-target="${v.id}"> ${v.icon.includes("https:")?`<img src="${v.icon}" width="24" height="24" />`:v.icon} <span>${v.name} </span> </li>`); 
                  }
                 });

                 if(win.Modules){
                   win.Modules.menu = $.extend(win.Modules.menu||{},r.menu,true);
                 }

                 win.user.roles = r.roles;
                 win.user.has_role = function(role){
                    return this.roles.includes(role);
                 };
                 win.user.has_access = function(role){
                    return this.roles.includes(role);
                 };

                  /*
                    listen role global to remove access
                    <button class="btn btn-primary roleaccess">Cập nhật</button>
                   */
                  $(document).on('init.bs.modal',".modal", function (e) {
                      var who = $(e.currentTarget); 
                      if(win.user&&!win.user.has_role('admin')){

                         who.find(".roleaccess").remove();
                      }
                  });


                StorePos.check();

                  
                 //check dev
                 if(AppRequest.BUILDDEV){
                  AppRequest.BUILDDEV();
                 }

                 if(f)f();


                 $(document).trigger("Modules_Ready",[]);

               }else{
                var dialog = bootbox.dialog({
                    title: 'Thông báo',
                    message: `
                        <div class="text-center">
                        <div><img width="75" height="75" src="https://cdn-icons-png.flaticon.com/128/1691/1691940.png" /></div>
                        <p>Tài khoản của bạn đã đăng nhập ở thiết bị khác. Hệ thống tự đăng xuất. Chúng tôi xin lỗi vì sự bất tiện này.</p>

                        </div>`,
                    size: 'large',
                    buttons: { 
                        ok: {
                            label: "Xác nhận",
                            className: 'btn-info',
                            callback: function(){
                                logoutUser();
                            }
                        }
                    }
                });
                 
               }
            },true);

            
            
          }

         
         
         
        },
        cache : (function(win,key){
   function md5(inputString) {
    var hc="0123456789abcdef";
    function rh(n) {var j,s="";for(j=0;j<=3;j++) s+=hc.charAt((n>>(j*8+4))&0x0F)+hc.charAt((n>>(j*8))&0x0F);return s;}
    function ad(x,y) {var l=(x&0xFFFF)+(y&0xFFFF);var m=(x>>16)+(y>>16)+(l>>16);return (m<<16)|(l&0xFFFF);}
    function rl(n,c)            {return (n<<c)|(n>>>(32-c));}
    function cm(q,a,b,x,s,t)    {return ad(rl(ad(ad(a,q),ad(x,t)),s),b);}
    function ff(a,b,c,d,x,s,t)  {return cm((b&c)|((~b)&d),a,b,x,s,t);}
    function gg(a,b,c,d,x,s,t)  {return cm((b&d)|(c&(~d)),a,b,x,s,t);}
    function hh(a,b,c,d,x,s,t)  {return cm(b^c^d,a,b,x,s,t);}
    function ii(a,b,c,d,x,s,t)  {return cm(c^(b|(~d)),a,b,x,s,t);}
    function sb(x) {
        var i;var nblk=((x.length+8)>>6)+1;var blks=new Array(nblk*16);for(i=0;i<nblk*16;i++) blks[i]=0;
        for(i=0;i<x.length;i++) blks[i>>2]|=x.charCodeAt(i)<<((i%4)*8);
        blks[i>>2]|=0x80<<((i%4)*8);blks[nblk*16-2]=x.length*8;return blks;
    }
    var i,x=sb(""+inputString),a=1732584193,b=-271733879,c=-1732584194,d=271733878,olda,oldb,oldc,oldd;
    for(i=0;i<x.length;i+=16) {olda=a;oldb=b;oldc=c;oldd=d;
        a=ff(a,b,c,d,x[i+ 0], 7, -680876936);d=ff(d,a,b,c,x[i+ 1],12, -389564586);c=ff(c,d,a,b,x[i+ 2],17,  606105819);
        b=ff(b,c,d,a,x[i+ 3],22,-1044525330);a=ff(a,b,c,d,x[i+ 4], 7, -176418897);d=ff(d,a,b,c,x[i+ 5],12, 1200080426);
        c=ff(c,d,a,b,x[i+ 6],17,-1473231341);b=ff(b,c,d,a,x[i+ 7],22,  -45705983);a=ff(a,b,c,d,x[i+ 8], 7, 1770035416);
        d=ff(d,a,b,c,x[i+ 9],12,-1958414417);c=ff(c,d,a,b,x[i+10],17,     -42063);b=ff(b,c,d,a,x[i+11],22,-1990404162);
        a=ff(a,b,c,d,x[i+12], 7, 1804603682);d=ff(d,a,b,c,x[i+13],12,  -40341101);c=ff(c,d,a,b,x[i+14],17,-1502002290);
        b=ff(b,c,d,a,x[i+15],22, 1236535329);a=gg(a,b,c,d,x[i+ 1], 5, -165796510);d=gg(d,a,b,c,x[i+ 6], 9,-1069501632);
        c=gg(c,d,a,b,x[i+11],14,  643717713);b=gg(b,c,d,a,x[i+ 0],20, -373897302);a=gg(a,b,c,d,x[i+ 5], 5, -701558691);
        d=gg(d,a,b,c,x[i+10], 9,   38016083);c=gg(c,d,a,b,x[i+15],14, -660478335);b=gg(b,c,d,a,x[i+ 4],20, -405537848);
        a=gg(a,b,c,d,x[i+ 9], 5,  568446438);d=gg(d,a,b,c,x[i+14], 9,-1019803690);c=gg(c,d,a,b,x[i+ 3],14, -187363961);
        b=gg(b,c,d,a,x[i+ 8],20, 1163531501);a=gg(a,b,c,d,x[i+13], 5,-1444681467);d=gg(d,a,b,c,x[i+ 2], 9,  -51403784);
        c=gg(c,d,a,b,x[i+ 7],14, 1735328473);b=gg(b,c,d,a,x[i+12],20,-1926607734);a=hh(a,b,c,d,x[i+ 5], 4,    -378558);
        d=hh(d,a,b,c,x[i+ 8],11,-2022574463);c=hh(c,d,a,b,x[i+11],16, 1839030562);b=hh(b,c,d,a,x[i+14],23,  -35309556);
        a=hh(a,b,c,d,x[i+ 1], 4,-1530992060);d=hh(d,a,b,c,x[i+ 4],11, 1272893353);c=hh(c,d,a,b,x[i+ 7],16, -155497632);
        b=hh(b,c,d,a,x[i+10],23,-1094730640);a=hh(a,b,c,d,x[i+13], 4,  681279174);d=hh(d,a,b,c,x[i+ 0],11, -358537222);
        c=hh(c,d,a,b,x[i+ 3],16, -722521979);b=hh(b,c,d,a,x[i+ 6],23,   76029189);a=hh(a,b,c,d,x[i+ 9], 4, -640364487);
        d=hh(d,a,b,c,x[i+12],11, -421815835);c=hh(c,d,a,b,x[i+15],16,  530742520);b=hh(b,c,d,a,x[i+ 2],23, -995338651);
        a=ii(a,b,c,d,x[i+ 0], 6, -198630844);d=ii(d,a,b,c,x[i+ 7],10, 1126891415);c=ii(c,d,a,b,x[i+14],15,-1416354905);
        b=ii(b,c,d,a,x[i+ 5],21,  -57434055);a=ii(a,b,c,d,x[i+12], 6, 1700485571);d=ii(d,a,b,c,x[i+ 3],10,-1894986606);
        c=ii(c,d,a,b,x[i+10],15,   -1051523);b=ii(b,c,d,a,x[i+ 1],21,-2054922799);a=ii(a,b,c,d,x[i+ 8], 6, 1873313359);
        d=ii(d,a,b,c,x[i+15],10,  -30611744);c=ii(c,d,a,b,x[i+ 6],15,-1560198380);b=ii(b,c,d,a,x[i+13],21, 1309151649);
        a=ii(a,b,c,d,x[i+ 4], 6, -145523070);d=ii(d,a,b,c,x[i+11],10,-1120210379);c=ii(c,d,a,b,x[i+ 2],15,  718787259);
        b=ii(b,c,d,a,x[i+ 9],21, -343485551);a=ad(a,olda);b=ad(b,oldb);c=ad(c,oldc);d=ad(d,oldd);
    }
    return rh(a)+rh(b)+rh(c)+rh(d);
}
      var mixedcache= win.localStorage.getItem(key);
      try{
          mixedcache = JSON.parse(mixedcache);
      }catch(e){}
      if(!mixedcache){
          mixedcache = {};
      }
       
      return function(){
             $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
        
              var auth =$('[name="auth-token"]').attr("content");
              if(auth){
                jqXHR.setRequestHeader( 'auth-token',auth);
              }
            

              if (originalOptions.type&&originalOptions.type.toLowerCase().includes("post")) {
          // if (options.cache) {
              var success = originalOptions.success || function(){},
                  url = originalOptions.url;
                  
              options.mixed_data = md5(url+"_"+(typeof originalOptions.data==="object"?JSON.stringify(originalOptions.data):originalOptions.data));
          
              options.cache = false;
              options.beforeSend = function () {
                  if (mixedcache[this.mixed_data]) {
                      success(mixedcache[this.mixed_data]);
                      // return false;
                  }
                  // return true;
              };
              options.success = function (data, textStatus) {
                  try{
                      var b = JSON.parse(data);
                      mixedcache[this.mixed_data] = b;
                  }catch(e){}
                 

                  win.localStorage.setItem(key, JSON.stringify(mixedcache));
                  var responseData = data?(typeof data==="object"?JSON.stringify(data):data.toString()):"";
                  
                  if (typeof success ==="function") success(data,textStatus);
              };
          // }
              }
          
          AppRequest.cache= {
             on : function(e,f){
                $(document).on("cache_"+e,f);
                return this;
             },
             trigger : function(e,args){
               $(document).on("cache_"+e,args||[]);
                return this;
             }
          };
      }); 
   }; 
      
  })(window,"ajax"+document.location.host.replace(/[^a-zA-Z0-9]/ig,""))
      };
    })(window);
  //////////////Build////////////////
 
AppRequest.cnd = function(){
    var cnds =[];
};
AppRequest.buildRole = function(){
  "api/admin/build/".api(function(r){

  });
};
AppRequest.BUILDDEV = function(){
     var historybuild ={

    };

   
     $(document).on("onLogout",function(e,u){
        historybuild={};
        storage(historybuild,"");
     }).on('shown.bs.modal','.modal', function (e) {
        var page = e.target.id;
        if(page!="ManageOutlet"){
          historybuild.path =page ;
          historybuild.data = page.pageData();

          window.localStorage.setItem("historybuild",JSON.stringify(historybuild));
        }
          
      });
     
      var n = storage("historybuild");
     if(n){
        n= JSON.parse(n);
     }
     historybuild  =$.extend({},n,true);

     if(historybuild.path){
        historybuild.path.navigate(historybuild.data);
     }
  };
 
 
String.prototype.loaderdata = function(options){
  var ele  = $(this.toString());

  ele.addClass("loaderdata");
  if(typeof options =="function"){
     options();
     setTimeout(function(){
        ele.removeClass("loaderdata");
     },2000);
  }else if(typeof options =="object"){
     options.url.post(options.data||{},function(r){
        ele.removeClass("loaderdata");
        if(options.callback){
            options.callback(r);
        }
     });
  }
};
String.prototype.loaderdataURL = function(url,data,f){
  var ele  = $(this.toString());

  ele.addClass("loaderdata");
   
  url.post(data||{},function(r){
    ele.removeClass("loaderdata");
    if(f){
        f(r);
    }
 });
  
};


function IP(){

    return "/";

  }

  function site_url(url){

    return url.includes("http")?url:appconfig.domain+url;

  }

  function site_url_ajax(url){

    return site_url(url);

  }



   window.session = function(){

    return "u_af";

};
  
function site_url_pos(url){
   return `${window.user.url}`+(url||"");
}

  
   

window.my_shop = function(){

  return StorePos.config.name||StorePos.config.name_outlet;

};

window.my_outlet = function(){

  return StorePos.config;

};
 

  window.ui = function(modal,options){

    options = $.extend({

       empty : `<img src="images/empty.png"><br/>

              <di>

                Hiện chưa có thông tin.

              </div>`,

      loading:`<i class="fa fa-spin fa-cog"></i> Đang tải...`



    },options,true);

    modal = modal||$(".modal");

    if(modal.find(".empty.ui").length==0){

       modal.find(".modal-body").prepend(`<div class="empty ui">

                ${options.empty}

            </div> 

            <div class="loading ui">

              ${options.loading}

            </div>`);

    }

    return {

      empty : function(fun){

        modal.find(".ui").addClass("hide");

        modal.find(".empty").removeClass("hide");

        modal.find(".loading").addClass("hide");

        if(fun)fun()

      },

      data : function(fun){

        modal.find(".ui").removeClass("hide");

        modal.find(".empty").addClass("hide");

        modal.find(".loading").addClass("hide");

        if(fun)fun()

      },

      loading : function(fun){

        modal.find(".ui").addClass("hide");

        modal.find(".empty").addClass("hide");

        modal.find(".loading").removeClass("hide");

        if(fun)fun()

      }

    };

  };
  function simplePaging(page, range,count) {
    //https://codepen.io/lorenzovngl/pen/xxKgJYm/
    var str="";
    if (page > 1) {
      str+=('<li class="page-item"><a class="page-link" href="#' + (page - 1) + '">Previous</a></li>');
    }
    for (let i = 1; i <= count; i++) {
      if (i == 1 && page - range > 1) {
         str+=('<li class="page-item"><a class="page-link" href="#1">1</a></li>');
        if (page - range > 2) {
           str+=('<li class="page-item disabled"><a class="page-link" href="#">...</a></li>');
        }
      }
      if (i >= page - range && i <= page + range) {
        if (i != page) {
           str+=('<li class="page-item"><a class="page-link" href="$' + i + '">' + i + '</a></li>');
        } else {
           str+=('<li class="page-item active"><a class="page-link" href=""#' + i + '"">' + i + '</a></li>');
        }
      }
      if (i == count && page + range < count) {
        if (page + range < count - 1) {
           str+=('<li class="page-item disabled"><a class="page-link" href="#">...</a></li>');
        }
         str+= ('<li class="page-item"><a class="page-link" href="#' + count + '">' + count + '</a></li>');
      }
    }
    if (page < count) {
       str+=('<li class="page-item"><a class="page-link" href="#' + (page + 1) + '">Next</a></li>');
    }
    return `<ul class="pagination pag2">${str}</ul>`;
  }



function htmlbody(){
      //for device
    if(window.ADevice){
        // alert(JSON.stringify(window.ADevice));

        $("body").append(`<style class="device">
            
            .mainpos{
              padding-bottom: ${window.ADevice.insets.bottom}px 0 !important; 
            } 
            </style>`);
      // .modal-header,.modal-header.header{
      //           padding-top: ${window.ADevice.insets.top}px!important;
      //       }
      //       .modal-footer{
      //           padding-bottom:  ${window.ADevice.insets.bottom}px!important;
      //       }
    }

    return `<div class="menu-tab">

    <div class="menubody">

    <div class="block-avatar _primary_bg">
      <div class="flex-row">
      <span class="closex" onclick="$('.menu-tab').toggleClass('active')"><i class="fa fa-times"></i></span>
     <div data-target="MyAccount" class="flex-row">
        <img class="images avatar" data-src="https://placehold.co/75x75/cecece/333/png">

        <p>
          <span>Xin chào</span> <br/>
          <span class="username fullname">--</span>
 
        </p> 
      </div>

     </div>
     <div class="blocksearch">
        --
     </div>
    </div>
    <div class="reportall roleaccess _primary_bg">
       <div class="lr">
          <span class="dateoutlet">07/07/2025</span>
          <span>
              <input type="date" class="form-control" />
          </span>
       </div>
          <div class="line flex-row" style='    justify-content: space-between;'>
             <button class="btn btn-success no">
                Đang xử lý
               <div class='total_sale'>0</div> 
             </button>
             <button class="btn btn-info no">
                Tiền cần thu
               <div class='money_need_got'>0</div> 
             </button>
          </div>
      </div>

    <div class="body"> 
      <div class="reportalla roleaccess text-center">
          <div class="line items" style='    justify-content: space-between;'>
             <div class="">
                Doanh thu
               <div class='total_sale'>0</div> 
             </div>
             <div class="">
                Đơn hàng
               <div class='total_inv'>0</div> 
             </div>
          </div>
      </div>
       
      

      <div class="allactions">

      </div>
      
       
    </div>

    <div class="foot">

      <p>Hotline: <a href="tel:+8489 837 2448" style="color: #fff">+840000000</a></p> 

      <div style="text-align: center;">

        <a href="#" style="font-size: 24px;color: #fff;" target="_blank">

          <i class="fab fa-facebook-square"></i>

        </a>

        <a href="#" style="font-size: 24px;color: #fff;" target="_blank">

          <i class="fab fa-youtube"></i>

        </a>

      </div>
      <p>Phiên bản: <a href="/v1/cua-hang/">1.0</a></p>
    </div>

  </div>

  </div>

  <div class="mainpos _primary_bg">

  

  <div class="box-row-col flex home">

    <div class="a-col">

      <div class=" header">

        <div class="flex-row iconleft">  

          <i class="fa fa-search prosearchicon hidden-lg hidden-md" onclick="$('.searchmain').toggleClass('active')" aria-hidden="true"></i>

          <i class="fa fa-bars show_menu visible-md visible-lg"></i> 

          <img onclick="$('.menu-tab').toggleClass('active')" data-src="/images/logo.png" class="logo logoshop hidden-sm hidden-xs" style="width: 30px;height: 30px;">

        </div>

        <div class="tab-button">

            <button type="button" style="    width: auto;margin-right:8px" class="btn btn-default pro active" data-tab="desktop-food"><i class="fa fa-book" aria-hidden="true"></i></button>

            <button type="button" class="btn btn-default inv" data-tab="desktop-inv">
              <i class="fa fa-shopping-cart" aria-hidden="true"></i>
              <span class="badge" style="    position: absolute;"></span>
            </button>


            
        </div>

        <div class="text-right iconright">
  
          <span class="scanqrcode hidden-md hidden-lg"><i class="fa fa-qrcode" aria-hidden="true"></i></span>
          

          <span  data-target="MySetting" class=""><img src='https://cdn-icons-png.flaticon.com/128/3524/3524636.png' /><span class="hidden-sm hidden-xs"> Cài đặt</span></span>

          <div class="dropdown visible-sm visible-xs" style="display:inline-block;    padding: 0;
    margin: 0;
    width: 50px;">
            <button style="background-color:transparent;" class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <i class="fa fa-bars" aria-hidden="true"></i>
            </button>
            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton" id="dropdownmobile">
              
            </div>
          </div>
      
        </div>

      </div>



    </div>

    <!--  -->

    <div class="a-col a-auto" id="collapseTwo">

        



<div class="loading loading-tb" style="display: none"><i class="fa fa-spin fa-cog"></i> Đang tải bàn...</div>

<div class="maincontent h100">

  

  <div class="row alldiv">

   <div class="col-md-7 col-xs-12 desktop-tab desktop-food">

      <div class="searchmain">

        <div class="searchmainbarcode">

          <button type="button" class="btn btn-primary btniconbarcode1 scanqrcode" style="height: 45px;"> <i class="far fa-barcode-read"></i> </button>

          <input placeholder="Nhập barcode"  type="search" class="searchbarcode form-control hide" >

        </div>

        <div class="search-box" id="menusearch" style="width: 100%;">

               <div style="background-image:url(https://access.donggiatri.com/svg/search.svg);" class="search"></div>

               <input type="search" placeholder="Tìm kiếm: sản phẩm, barcode"  class="form-control">

        </div>

        <div class="">
          <div class="dropdown showgridcol">

              <button class="btn no btn-primary dropdown-toggle" type="button" data-toggle="dropdown"><i class="fa fa-table" aria-hidden="true"></i></button>

              <ul class="dropdown-menu">
 
              </ul>

            </div>
        </div>

        

      </div>

      <div class="my-tabs fixed">



        <div class="groupcate flex-row">

            <div class="desktop-menu flex simple-scroll scroll-tab my-products-tab">

            <button type="button" class="btn btn-default mh active" data-id="featured">Nổi bật</button>

            <!-- <button type="button" class="btn btn-default mh active" data-id="all">Tất cả</button> -->

          </div>

          <div class="actions">
              <span data-modal="MyProductSaleCreateSimple" class="roleaccess">
                <i  class="fa fa-plus-circle " style="font-size: 14px;"></i>
              </span>
          </div>

        </div>

        

        <div class="bodyproducts">



           <div class="listproduts loaderdata my-products row">

              <div class="text-center effect" style="font-size: 14px;margin-bottom: 8px;"><i  style="font-size: 14px;" class="fa fa-spin fa-spinner"></i> Đang xử lý...</div>

           </div>


           <!-- <span data-modal="MyProductSaleCreateSimple" style="position: absolute;bottom:10px;right:10px;cursor: pointer;" class="roleaccess"><i class="fa fa-plus-circle" style="font-size: 14px;"></i> Sản phẩm</span> -->

        </div>  

      </div>

   </div>

   <div class="col-md-5 col-xs-12 desktop-tab desktop-inv">

     <div class="orders">
       <div class="flex-row">
          <div class="simple-scroll scroll-tab actioninv flex"> </div>

        <div class="no dd-new btn-inv btn btn-primary">

           <i class="fa fa-plus-circle" style="font-size: 14px;"></i> 

        </div>
       </div>
        

        <div class="blockorder">

          

        </div>

        <div class="actions show_action hide lr text-center"> 

           

           <div class="text-right buttons">

             <button class="btn btn-danger btn-cancel-payment mr" ><img src="https://cdn-icons-png.flaticon.com/128/1828/1828665.png" class="visible-xs visible-sm" width="24" height="24" /> <span>Huỷ</span></button>

             <button class="btn btn-primary btn-payment-quick mr"><img src="https://cdn-icons-png.flaticon.com/128/9428/9428503.png" class="visible-xs visible-sm" width="24" height="24" /> <span>Thanh toán</span></button>
 
           </div>     

        </div>

     </div>

   </div>

  </div>

</div>
 

  <!-- show notification for confirmation -->

  <!-- <div class="hide tb-kitken-notify">

    <div class="kitken-notify scroll">

      <div class="block">

        <span>Ngày tạo</span>

        <span class="notranslate">{{created_date}}</span>

      </div>

      <div class="block">

        <span>Bàn</span>

        <span class="notranslate">{{name}}</span>

      </div>

      <div class="block">

        <span>Tạm tính</span>

        <span class="bold notranslate">{{total}}</span>

      </div>

      {{block_menu}}

    </div>

  </div> -->

  <!-- item list menu -->

<!--   <div class="block-menu-wrapper hide">

    <div class="block-menu">

      <div class="block"><span>Thời gian</span><span>{{date}}</span></div>

      <div class="block"><span>Nhân viên</span><span>{{fullname_user}}</span></div>

      <div class="customer"></div>

      <ul style="list-style: decimal;padding: 8px 32px;border-radius: 8px;border: 1px solid #f1f1f1;">

        {{menu}}

      </ul>

      <div class="block"><span>Tình trạng</span><span class="bold notranslate">{{status}}</span></div>

      <div class="block"><span>Thành tiền</span><span class="bold">{{subtotal}}</span></div>

      <div class="actions">

        <button class="btn btn-danger btn-sm btn-delete">Xoá</button>

      </div>

    </div>

  </div>



  <div class="block-menu-wrapper-takeaway hide">

    <div class="block-menu">

      <div class="block"><span>Thời gian</span><span>{{date}}</span></div>

      <div class="block"><span>Nhân viên</span><span>{{fullname}}</span></div>

      <div class="customer"></div>

      <ul style="list-style: decimal;padding: 8px 32px;border-radius: 8px;border: 1px solid #f1f1f1;">

        {{menu}}

      </ul>

      <hr>

      <div class="block"><span>Mã STT (Khách hàng giữ)</span><span class="bold notranslate">{{stt}}</span></div>

      <hr>

      <div class="block"><span>Mã khay</span><span class="bold notranslate">{{tray}}</span></div>

      <hr>

      <div class="block"><span>Tình trạng</span><span class="bold notranslate">{{status}}</span></div>

      <hr>

      <div class="block"><span>Thành tiền</span><span class="bold">{{subtotal}}</span></div>

      

    </div>

  </div>
 
 

<!-- Inv 58mm -->

<div class="print58mm hide" style="font-size: 12px; font-family: Arial"> </div>
 

       

    </div>
    <!--  -->


    <div  class="a-col">

     <div class="text-center support ">

       
       <span onclick="AppRequest.changeOutlet();">
        <span class="hidden-sm hidden-xs">Truy cập cửa hàng</span>
        <img data-src="https://cdn-icons-png.flaticon.com/128/10184/10184053.png" class="icon hidden-md hidden-lg">
      </span>
       

        
        <span onclick='$(".menu-tab").toggleClass("active")' class="PosMenu">
           <span><img style='max-width: inherit;' data-src="https://cdn-icons-png.flaticon.com/128/12679/12679211.png" width="24" height="24" /></span>
        </span>
        

          <!-- <span> <a href="#" style="color:#ccc">Chat support</a></span> -->

      
          <span data-target="PosShare">
            <span class="hidden-sm hidden-xs">Chia sẻ</span>
            <img data-src="https://cdn-icons-png.flaticon.com/128/2958/2958783.png" class="icon hidden-md hidden-lg">
          
          </span>
       
 
     </div>

    </div>

  </div>

  

</div>

 


 

<nav style="display:none">

    <ul class="row tabsmenu">

        <li class="back hide"><i class="fa fa-chevron-left" aria-hidden="true"></i><span>Quay lại</span></li>

        <li class="active" data-target="home"><img src="images/ic/spa-trangchu.png" alt=""> <span>Trang chủ</span></li>

        <li>

          <img class="icon" src="images/ic/spa-lichhen.png" alt=""> <span> Lịch hẹn</span></li>

        <!-- <li onclick="$('#MyTableMerge').modal()" style="position: relative;"> 

          <span class="counter notranslate" style="top: 0px;right: 0px;background-color: red;display: block;color: #fff;"></span>

          <img class="icon" src="images/board.png" alt=""> <span>Báo cáo</span></li> -->

        <li data-target="MyHistorySale"><img class="icon" src="images/ic/spa-baocao.png" alt=""><span>Báo cáo</span></li>

        <li data-target="#MyAccount"><img src="images/ic/spa-account.png" alt=""><span>Tài khoản</span></li>

    </ul>

</nav>`;
}

function stepactive(){
  
}
/*
uploadui("form",{
    name:"image",
    size:105,
    callback: function(src){
        form.find(".ass").val(src);
    }
});
 */

function uploadui(form,options){
     

       var bar = null;

       options.name.pickerImageResize({
        url : options.url||site_url_ajax("api/upload/base64/"),
        width:options.size||105, 
        ready : function(src,file){
            options.callback(src);
            bar = $.progressCircle({parent:form,size:40});
        },
        onProgress : function(per){
            per = Math.ceil(per*100);
            bar.update(per);
        },
        callback:function(src,ac){
 
          if(ac=="end"){
            bar.remove();
            options.callback(src);
          } 
        }
    });
}



function main(){ 
    File.settings.upload= site_url_ajax("api/upload/file/")||"https://data.donggiatri.com/databases/upload.php";
    File.settings.uploadbase64= site_url_ajax("api/upload/base64/")||"https://data.donggiatri.com/databases/upload.php";
    File.settings.onData = function(data){
        data.shop_id = AppConfig.shop_id;
        data.id_outlet = AppConfig.id_outlet;
        return data;
    };
    File.settings.onHeader = function(data){
        data["auth-token"] =  AppConfig.passkey || window.user.passkey || $("meta[name='auth-token']").attr("content");
        return data;
    };

     

    $(document).on("click","[image-resize]",function(){
       var me = this;
       var form = $(me).closest("form");
       if(form.length==0){
          form = $(me).closest("div");
       }
       var parent = $(me).closest("div");
       var name = $(me).attr("image-resize");
       console.log(name);

       var bar = null;

       name.pickerImageResize({
        url : File.settings.uploadbase64,
        width:$(me).attr("image-size")||105, 
        ready : function(src,file){
            me.src=src;
            bar = $.progressCircle({parent:parent,size:40});
        },
        onProgress : function(per){
            per = Math.ceil(per*100);
            bar.update(per);
        },
        callback:function(src,ac){
 
          if(ac=="end"){
            bar.remove();
            form.find("."+name).val(src);
          } 
        }
      });
    }).on("click","[image-picker-name]",function(){
       var me = this;
       //  <img class="avatar" image-picker-size="75" image-picker-control=".name" image-picker-name="image" image-picker-target="image" src="" ><br/>


       File.pickerImage({ 
        callback:function(src,callback){
            var form = $(me).closest("form");
           if(form.length==0){
              form = $(me).closest("div");
           }
           var parent = $(me).closest("div");
           var field = $(me).attr("image-picker-name");   

           var name = field;
           var control = $(me).attr("image-picker-control"); 
            if(control){
                name = form.find(control).val().make_slug();
            }

            me.src=src.base64;

            var bar =  $.progressCircle({parent:parent,size:40});

            //

            uploadFile({file:src,name:name},File.settings.upload,function(r){
                bar.remove();
                form.find("."+field).val(r.url);
            },{
                onProgress: function(per){
                    per = Math.ceil(per*100);
                    console.log(per);
                    bar.update(per);
                }
            }); 
        }
      });
    });


  f7Shortcode.add("webshare",function(data,page){
       var url =site_url_pos();
      return `<div class="white-view">
          <p>Chia sẻ website</p> 
          <div class="form-group sharewebsite flex-row">
               
               <input type="text" id="xxx" name="xxx" class="form-control" value="${url}">
               <button class="btn" data-copy="value="${url}"><i class="fa fa-clone" aria-hidden="true"></i></button> 
          </div>
      </div>`;
  });

   
  //load pr and publci data app
  $(document).ready(function(){
     AppRequest.pr();


  });

  
   $(document).on("onApp",function(e){ 

      var popups = AppConfig.popup||[]; 
      if(popups.length){
          var dialog = bootbox.dialog({
            className:"modal-flex1",
            title :"Quảng cáo",
            message:`<div style="    height: 100%;" class="swiper-container swiperpopup"><div class="swiper-wrapper popups">${popups.map(function(v){
                      v.content = new Handlebars.SafeString(decodeHTMLEntities(v.content));
                     return Handlebars.compile(`<div class="swiper-slide popupitem">
                        <div class="body">{{content}}</div>
                    </div>`)(v);
                }).join("")}</div><div class="swiper-pagination"></div></div>`
          });
          dialog.init(function(){
            dialog.find(".modal-header").addClass("header");
            var swiper = new Swiper(dialog.find(".swiperpopup")[0], {
                pagination: dialog.find(".swiper-pagination")[0],
                paginationClickable: true,
                parallax: true,
                speed: 600,
                autoplay: 3500,
                loop: true,
                grabCursor: true 
              });

        });
      }

   });
  //watch and wait notice from admin
  $(document).on("onApp",function(e,config){

     
       
    
    //ping
      // setInterval(function(){
      // AppRequest.heartbeat(function(){
      // 
      // });
        
    // },50*1000);
      
  });

  //checker step for admin or manager
  $(document).on("onApp",function(){
    var config = AppConfig;
    var steps ={}; 
     
    

   

    // if(!config.total_stock){
    //   steps.total_stock = `<div class="lr">
    //       <div>Nhập kho: Chưa có</div>
    //       <div><span class="btn btn-xs btn-primary" data-router="">Cài đặt</span></div>
    //     </div>`; 
    // }
    
    //fired
    $(document).trigger("onStepSetup",[steps]);

    var s = Object.values(steps);
    if(s.length){
       s =`<div class="stepactive"><div><img width="75" height="75" src="https://cdn-icons-png.flaticon.com/128/7224/7224308.png" /></div>
       <p>Các bước cài đặt cửa hàng:</p>
       <ul>${s.map(function(v){
          return `<li>${v}</li>`;
       }).join("")}</ul>
       </div>
        `;
       alert(s,"Cài đặt cửa hàng");
    }


    $(".PosMenu").on("click",function(){ 
       $(document).trigger("PosMenu",[{opened:1}]);
    });
  });


 
}



function LoadCSS(e){return new Promise(function(n,t){var o=document.createElement("link");o.rel="stylesheet",o.href=e,document.head.appendChild(o),o.onload=function(){n(),console.log("CSS has loaded!")}})}function LoadJS(e){return new Promise(function(n,t){var o=document.createElement("script");o.type="text/javascript",o.src=e,document.head.appendChild(o),o.onload=function(){n(),console.log("JS has loaded!")},o.onerror=function(){}})}

// var root = document.location.host.includes(".byethost")?"https://"+document.location.host+"/":"/build/";
var root = "/s/pos/";
 
 
 
window.onload = function(){

    document.querySelector(".imgbox").innerHTML =`<img src="${AppRequest.logo()}" width="125" alt="">`
};
 
function setupTheme(){
    (function(win){
        var key = "setting_staff";
        var settings = storage(key); 
        win.AClient = {
            settings: settings||{
                synce_takeaway:1,
                allow_print:1,
                socket_url:'',
                html_print:''
            },
            save : function(){
                storage(key,this.settings); 
            }
        };
        if(win.AClient.settings.html_print){
            win.printTempate = decodeHTMLEntities(win.AClient.settings.bill_80||win.AClient.settings.html_print);
        }
        
        

        $(document).on("onUserLogout",function(e){
          storage(key,'{}'); 
        });
    })(window);

}

LoadCSS(root+"app.min.css?t=1760009170").then(function(){
   LoadJS(root+"app.min.js?i=1&t=1760009170").then(function(){ 
    $("body").append(htmlbody());


    setupTheme();


    $(document).on("onApp",function(){ 
        window.localStorage.setItem("_logo",AppRequest.logo());
    });

      main();

      $("body").addClass("loaded");

      LoadCSS(root+"/font.css?t=3",function(){});
   });
});

window.MyTabs= function(options){
      var tabs = {};
      var initdata = null;
      var page = null;

      function setup(ele){
          page = typeof ele=="string"?$(ele):ele;
          if(page.find("ul.maintab").length==0){
            page.html(`<div class="tabspage fullheight flex-row"><ul class="nav nav-pills maintab" role="tablist" data-tabs="tabs"></ul><div class="tab-content maintab flex-col"></div></div>`);
          }

        
          var nn = page.find("div.tabspage").eq(0);
          methods.$={};
          methods.$.tab = nn.find(".ul.maintab").eq(0);
          methods.$.content = nn.find("div.maintab").eq(0);

          if(methods.scrollable){
            methods.$.tab.addClass("scrollable");
          }


          page.on("click",'.maintab[data-tabs="tabs"] a',function(e){ 
            var id = $(this).attr("href").replace("#","");
            if(id&&tabs[id] && tabs[id].onActive){
                tabs[id].onActive.call({initData:initdata},e);
            }
          });
      }

      var methods =$.extend({ 
         scrollable:1,
         add: function(options1){
             var id="setting"+options1.id;
            tabs[id] = options1;
           
            options1.onActive = options1.onActive||function(){};

            if(page){

                 this.$.tab.append(`<li class="${id}"><a href="#${id}" data-toggle="tab">${options1.name}</a></li> `);
                 this.$.content.append(`<div role="tabpanel" class="tab-pane fade" id="${id}">${typeof options1.content=="function"?options1.content.call(initdata||{}):options1.content}</div>`);
                
            }
            return this;
         },
         remove : function(name){
            var id="setting"+options.id;
            page.find(" ."+id).remove();
            page.find(" #"+id).remove();
            return this;
         },
         destroy : function(){
             initdata =null;
             tabs ={};
             page =null;
            return this;
         },
         init : function(ele,data,f){

            if(typeof data=="function"){
                f= data;
                data ={};
            }

            initdata = data;
            setup(ele);
            for(var id in tabs){
                var options1 = tabs[id];
                 this.$.tab.append(`<li class="${id}"><a href="#${id}" data-toggle="tab">${options1.name}</a></li> `);
                 this.$.content.append(`<div role="tabpanel" class="tab-pane fade" id="${id}">${typeof options1.content=="function"?options1.content.call(initdata||{}):options1.content}</div>`);
                
            }
            return this;
         }
      },options,true);

      

    return methods;
  };
 


// setInterval(function(){
//     // AppCode.Report();
//     try{
//       window.AppCode.printHTML('<p>this is <b>html</b> test</p>');
//     }catch(e){
//        alert(e);
//     }
// },10000);
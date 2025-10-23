
var appconfig={
      domain:"https://acuamientay.click/", 
      shop_id:"",
        logo : "https://cdn-icons-png.flaticon.com/128/12679/12679211.png",
        banner : "https://images.unsplash.com/photo-1707343848610-16f9afe1ae23?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxlZGl0b3JpYWwtZmVlZHwxfHx8ZW58MHx8fHx8",
        title : "",
        address : ""
};
function site_url(url){

  // return (document.baseURI.includes(document.location.origin)?("/"):document.baseURI)+url;
  return appconfig.domain+url;

}

function site_url_ajax(url){

  return appconfig.domain+(url);

}

(function(win){
    var list={};
    win.promise= {
       add : function(a){
          var id = Date.now();
          list[id] = a;
          a.then(function(){
            list[id] =1; 
            promise.onUpdate(Object.values(list).filter(function(v){
              return v==1;
            }).length,Object.keys(list).length);
          });
       },
       post : function(url,data,f){
           return new Promise(function (done) {
            post(url,data,function(r){
              f(r);
              done({url:url,data:data,response:r});
            },true); 
          });
       },
       onUpdate : function(completed, total){
         console.log(completed + '/' + total);
       }
    };
})(window);

(function(win){

  win.AppRequest ={
    color : function(color){
        this.cache.storage("_theme",color);
        $("body").attr("data-color",color);
        return this;
    },
    logo : function(f){
        var logo = "images/logo.png?t=1";
        if(win.AppConfig && AppConfig.setting.pr){
            logo = win.AppConfig.setting.pr?AppConfig.setting.pr.logo:"images/logo.png?t=1";
            win.localStorage.setItem("_logo",logo);
            return logo;
        } 
        logo = win.localStorage.getItem("_logo")|| logo; 
        return logo;
    },
    scan : function(){
        this.post(this.site_url_ajax("api/user/scan/"),{},function(r){
            AppConfig = $.extend(AppConfig,r.data,true);
        });
        return this;
    },
    share : function(s){
       win.Share(s||`Bạn đang chia sẽ  ${this.site_url("?ref="+this.getUser().barcode)}`);
       return this;
    },
    open : function(data){
        return new Promise(function(a,b){
            if(win.openWindow){
               var i= openWindow(data);
               a(i);
            }else{
                win.open(typeof data=="string"?data:data.url);
            }
        });
        return this;
    },
     site_url : function(url){
       return AppConfig.setting.server_pr+(url||"");
    },
    site_url_ajax : function(url){
       return "/"+(url||"");
    },
    goHome : function(){
        if(win.closeAll){
            closeAll();
        }
        bootbox.hideAll();
        $('.modal').modal('hide').remove();
    },
    getUser : function(){
        return userSDK.getUser();
    },
    login : function(f){
        userSDK.open(f);
      return this;
    },
    logout : function(f){
        bootbox.confirm(`<div class='text-center'><img width='65' src='https://cdn-icons-png.flaticon.com/128/16205/16205076.png' /></div>
          <h3>Yêu cầu đăng xuất.</h3>`,function(ok){
              if(ok){
                 userSDK.logout(function(){

                 });
                 if(f)f();
              }
            });
      return this;
    },
    downloadApp : function(f){
        bootbox.confirm(`<div class='text-center'><img width='65' src='https://cdn-icons-png.flaticon.com/128/16205/16205076.png' /></div>
          <h3>Không hỗ trợ tính năng!.</h3>
          <div>Quét Qrcode không hỗ trợ trên hệ thông website. Vui lòng tải app để sự dụng tính năng này.</div>`,function(ok){
              if(ok){
                 window.open("https://play.google.com/store/apps?hl=en");
              }
            });
      return this;
    },
     post : function(url,data,f){
         data = data||{};
         data.shop_id = this.shop_id;

         promise.add(new Promise(function(a,b){
            if(win.AppConfig && AppConfig.passkey){
                data.auth_hash = AppConfig.auth_hash;
                data.auth = true;


                $.ajax({
                    headers: {
                        'auth-token':AppConfig.passkey
                    },
                    url: url,
                    type: "POST",
                    data: data,
                    async: true,
                    success: function(u) {
                        try {
                            u = JSON.parse(u.trim())
                        } catch (_) {}
                        f(u);

                        a({url:url,data:data,response:u});
                    },
                    error: function(u, _, E) { 
                        this.success(u.responseText);
                    }
                });
                
             
             }else{
                 post(url,data,function(r){
                      f(r);
                    a({url:url,data:data,response:r});


                 },true);
             }
        
            
        }));

         
         return this;
     },
     beforeSend : function(data){
       data.shop_id = this.shop_id;
       return data;
     },
     shop_id:appconfig.shop_id,
     config : function(data,f){
        var u = this.getUser();
        if(u){
            //au assign from user center
            data.barcode = u.barcode;
        }
        
        this.post(site_url_ajax("api/customer/auth/"),data,function(r){
            if(r.code){
                win.AppConfig = $.extend(win.AppConfig||{},r,true);
             
                if(f)f(AppConfig);
            }else{
                if(f)f(null);
            }
 
        });
        return this;
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
       
      return function(f){
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
                 

                  save();
                  var responseData = data?(typeof data==="object"?JSON.stringify(data):data.toString()):"";
                  
                  if (typeof success ==="function") success(data,textStatus);
              };
          // }
              }
          function save(){
            win.localStorage.setItem(key, JSON.stringify(mixedcache));
          }
          AppRequest.cache= {
             on : function(e,f){
                $(document).on("cache_"+e,f);
                return this;
             },
             trigger : function(e,args){
               $(document).on("cache_"+e,args||[]);
                return this;
             },
             storage : function(k,v){
                if(!v){
                    return mixedcache[k]||"";
                }
                mixedcache[k]  = v;
                save();
                return this;
             }
          };

          if(f)f();
      }); 
   }; 
      
  })(window,"ajax"+document.location.host.replace(/[^a-zA-Z0-9]/ig,"")),
     ready : (function(){
         
        var T= function(f){
            if(win.AppConfig){
                if(f)f();
                return;
            }else{
                T.ff.push(f);
            }
        };
        T.ff = [];
        return T;
     })(),
     pr : (function(){



        function abc(me,r,f){
            win.AppConfig = $.extend(win.AppConfig||{},r,true);
            $(document).trigger("AppConfig",[AppConfig]);
            if(f)f(AppConfig);

            if(me.ready.ff){
                me.ready.ff.map(function(v){
                    if(typeof v=="function"){
                        v(AppConfig);
                    }
                });
                delete me.ready.ff; 
            }

            var options ={
                  className:"special",
                  size: 'large',
                  buttons: {
                       
                      ok: {
                          label: "Đóng",
                          className: 'btn-info',
                          callback: function(){
                              console.log('Custom OK clicked');
                          }
                      }
                  }
            };

            var popups  = AppConfig.popup||[];
//             if(popups.length==0){
//                 popups.push({
//                     title:"VPS Gi&aacute; Rẻ 799K/Năm &ndash; Vận h&agrave;nh web mượt m&agrave;",
//                     content:`<p>VPS Gi&aacute; Rẻ 799K/Năm &ndash; Vận h&agrave;nh web mượt m&agrave;</p>

// <p><img alt="💼" height="16" referrerpolicy="origin-when-cross-origin" src="https://static.xx.fbcdn.net/images/emoji.php/v9/tac/2/16/1f4bc.png" width="16" /> Bạn l&agrave;m web, bạn hiểu: tốc độ v&agrave; uptime l&agrave; sống c&ograve;n! Nhưng VPS tốt thường gi&aacute; cao, VPS gi&aacute; thấp th&igrave; hỗ trợ yếu, downtime li&ecirc;n mi&ecirc;n...</p>

// <p><img alt="🎯" height="16" referrerpolicy="origin-when-cross-origin" src="https://static.xx.fbcdn.net/images/emoji.php/v9/t4f/2/16/1f3af.png" width="16" /> Giải ph&aacute;p VPS vSan ESA &ndash; Mạnh mẽ, hiệu năng vượt trội!</p>

// <p>🖧 2 vCPU Intel Xeon Gold</p>

// <p>🖧 RAM 2GB &ndash; ph&ugrave; hợp web vừa &amp; nhỏ</p>

// <p>🖧 SSD NVMe U.2 30GB &ndash; lưu trữ si&ecirc;u tốc</p>

// <p>🖧 Băng th&ocirc;ng kh&ocirc;ng giới hạn</p>

// <p>🖧 01 IPv4 ri&ecirc;ng &ndash; tối ưu SEO &amp; bảo mật</p>

// <p>🖧 Miễn ph&iacute; chuyển dữ liệu từ hosting kh&aacute;c</p>

// <p>🖧 Uptime cam kết 99.9%, support 24/7</p>

// <p><img alt="👉" height="16" referrerpolicy="origin-when-cross-origin" src="https://static.xx.fbcdn.net/images/emoji.php/v9/tf0/2/16/1f449.png" width="16" /> Li&ecirc;n hệ với nh&acirc;n vi&ecirc;n kinh doanh &ndash; nhận th&ecirc;m ưu đ&atilde;i 10% cho năm đầu</p>

// <p><img alt="💸" height="16" referrerpolicy="origin-when-cross-origin" src="https://static.xx.fbcdn.net/images/emoji.php/v9/t1/2/16/1f4b8.png" width="16" /> Chỉ 799K/Năm, kh&ocirc;ng ph&aacute;t sinh, kh&ocirc;ng tăng gi&aacute;</p>

// <p><img alt="🎁" height="16" referrerpolicy="origin-when-cross-origin" src="https://static.xx.fbcdn.net/images/emoji.php/v9/t23/2/16/1f381.png" width="16" /> Tặng th&ecirc;m 2 th&aacute;ng FREE khi chuyển từ nh&agrave; cung cấp kh&aacute;c</p>

// <p><img alt="👉" height="16" referrerpolicy="origin-when-cross-origin" src="https://static.xx.fbcdn.net/images/emoji.php/v9/tf0/2/16/1f449.png" width="16" /> Xem chi tiết tại: <a attributionsrc="/privacy_sandbox/comet/register/source/?xt=AZUTSazKHTb6HekF1x5fyy5uu1xwhpYYcXAuvOWMqFIzStCLM15o-Uu5Ny-KI22nyY0nToahzpVpTXWDR9i6tZOJbnPsQx-GNW5rqHad2qwoF1089bAtLkHtTBGZKhSGAe8zzcdkVLrZG-K6q2LjGcV3-Gv8W_Wujdqvhj0BcYQPpGhUaaO1TdROyBIub_WdnoxXc7QSqOGL8t-gjDN3hFHbuP8ce-jfgmgo--HHg-3iNzYce16GaOMZ8UrzOJOAvUJO226Pg5tuRXz7sfm-LyBxvhkRJCM9NdzBRWURkzd9-ol5t-oCO0a9ndLin2fWwQxUH8LQUhaF1nHvZDJ3ym5HkLh_7TIAdRyQf8BHWXWM28tNSkb1Ju6iQmH3WdQcCWBN_ofKnGK7kVw0HlqNnEtOlIvrbb0BaIS3W4mbPKyTPdsGS7DsERx_gW3XqstCJtoOWW2eQ0POMeEzweCKIM0x4OvvHGDt0MYixgHR7dmEpqF_xGwagDZDemveGQG5aEpywLDkWo1vIpCMaaWXL53SEcBJCDvabBYPsDnUB3XT57fejwbfcGuHVFLuLciIcZp5rLKFYwBUUW5wUJWIopgJtKlDqIsSvxZW4sLHmJTBZ5YLv5stiW5jMFiC5Z7Jt01wsKjwWKxVvE7-hC4lzUNJBtjAmtqip1TPthOUXdi62wJ0vDuYStVtrfYuzr7llSxf_O0lYRGDQKrli4isfs07OleidNAHUVVQTBvO0yt2zjcRlw63B-i7xQK3NCbXVkUl8nubd-8w5NCh_y5uimIGdaFM6-wtw7i9gwaQmzLHCQLjZN06-D1bNNCY4SdfI8McWfD1-KqBRvMr2pERoDHw3jnztRPMwo37pMJCM2zlRVRyHXNfw486DeZ9t7NU2-grQZcdCmw22PXFxu4KeeUG7t3PZUt9piZXE6Xpwa1sD_495KBGQEb21fC7jgT4KUKkG5nP-plgeJTUCtrADKeC8ieYTI7bXQecLYlHfYH-7Kkv1HNyJEglEcCIOGXNG04LBTRHAVgBPrqqKhrClSWmQqXmVMCubOdgnP5krGL-RcQnvdxd29wENxfJrdgoQR3A8__gjme7pIPiFY3nGIxlhnA8WFxRZ8M43wQSWRF4BNIwnj0Ie3Gor--uf6UqrzpbMvM2WmM5V5eLpBrsimkBMzQ3k6fHunbctRCaqK_Ieyse4TKFkvKfYf6XHEDqgIIxCl4DvF8MXg7ADLIrUqW246uWFzwT2CzJKm_0_2mhlqS7edGiWnh7_0JGPGtGt46AW7oSgYQcw_sTN6AF78xMncVg1nycu-UtIzOqMPebirkrX15hH-aBiAywhGATA73Ov2S0IRsaXHbX17Qnt-EtpDDmhZXrtLPC9_fz7rUj7hPe07a0funwJlCxfN_FoDJpj8lvprE7fhSE9sCOOKbYXe1--rXq0n_lyaMHIsLUQfV2VFITxJrjmM8Asyr6jRh4iYCSAi4BhFadlf9mONg1XQ7BQmrmQrgqDOQbClbhoPCuLQ66O2MwqopWzmyNtPRuLJhOJVq2Dfr58VaR-6n-kFgdbAXwPaSdKXWqGEHsYZFt1R8N8O04JSUydu81BvegXoBDVvEBsZ4ZbeAd-tcPxeo0DEPhLlyheBHvB63Glg" href="http://eztech.vn/vps-gia-re/?fbclid=IwZXh0bgNhZW0CMTAAYnJpZBExMnpOeFhxUG14QllZdXFNQQEeQOmUWhbXW9BbWiwluRg8DZHGZt7v9kNV7-C5ozEGbwVHoYK1suwZpX2TS9A_aem_-ymKHNRORH6P7mkrLitKCA" rel="nofollow noreferrer" role="link" tabindex="0" target="_blank">eztech.vn/vps-gia-re/</a></p>

// <p><img alt="📩" height="16" referrerpolicy="origin-when-cross-origin" src="https://static.xx.fbcdn.net/images/emoji.php/v9/t5f/2/16/1f4e9.png" width="16" /> Inbox ngay để được tư vấn miễn ph&iacute; v&agrave; chốt gi&aacute; tốt nhất!</p>

// <p><img alt="📍" height="16" referrerpolicy="origin-when-cross-origin" src="https://static.xx.fbcdn.net/images/emoji.php/v9/tcc/2/16/1f4cd.png" width="16" /> C&Ocirc;NG TY TNHH C&Ocirc;NG NGHỆ EZ</p>

// <p><img alt="🏢" height="16" referrerpolicy="origin-when-cross-origin" src="https://static.xx.fbcdn.net/images/emoji.php/v9/t97/2/16/1f3e2.png" width="16" /> Địa chỉ: 72 Đường số 6, KDC Cityland Park Hills, P.10, Q.G&ograve; Vấp, TP.HCM</p>

// <p><img alt="📩" height="16" referrerpolicy="origin-when-cross-origin" src="https://static.xx.fbcdn.net/images/emoji.php/v9/t5f/2/16/1f4e9.png" width="16" /> Inbox để được tư vấn miễn ph&iacute; ngay h&ocirc;m nay!</p>

// <p><img src="https://scontent.fsgn5-14.fna.fbcdn.net/v/t39.30808-6/517747285_122160341786523316_920176795896177425_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=127cfc&_nc_ohc=g-ZhiU4AnVAQ7kNvwF5rdHK&_nc_oc=Adn7Y799KmheJyHUh3tCS94WMvnoX-BLXEIF5zkMdS5tKu7oVtz7iT0YJe9G7QHleluDFnDHlQ2W-5BxQUMt5H1S&_nc_zt=23&_nc_ht=scontent.fsgn5-14.fna&_nc_gid=OMaQRHyeGnDoaNvf97DekQ&oh=00_AfTEa_jj2Tgd0vehMaRAAJV16zWZomqMDiMnV6QVcHyFMg&oe=687680CF" /></p>`

//                 });
//             }

            if(AppConfig.setting.pr&&AppConfig.setting.pr.popup){
             popups.push({
                title:AppConfig.setting.pr.popup.title||'A custom dialog with buttons and callbacks',
                content: AppConfig.setting.pr.popup.content||"<p>This dialog has buttons. Each button has it's own callback function.</p>"
             });
 
                
            } 
 
            if(popups.length){
     
                   options.title = 'Thông báo';
                   options.message = `<div class="swiper-container swiperpopup" style='height: 100%;'><div class="swiper-wrapper popups">${popups.map(function(v){
                      v.content = new Handlebars.SafeString(decodeHTMLEntities(v.content));
                     return Handlebars.compile(`<div class="swiper-slide popupitem">
                        {{content}}
                    </div>`)(v);
                   }).join("")}</div><div class="swiper-pagination" style="position: absolute;bottom: 0;"></div></div>`;
                   
                 //go
                var dialog = bootbox.dialog(options);
                dialog.init(function(){
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
        }
        
        return function(f){

            var me = this;


            if(!appconfig.shop_id){
                me.post(site_url("v1/shop/"),{slug:document.location.pathname.replaceAll("/","")},function(r){
                    if(r.code){
                        me.shop_id = r.data.shop_id;
                        appconfig.shop_id= r.data.shop_id;

                        // r = $.extend(r.pr,r.data,true);

                        me.pr(f);

                        

                        // {
                        //     shop_id:"",
                        //     logo : "https://pos.donggiatri.com/images/pos-banner.png?t=1",
                        //     banner : "https://pos.donggiatri.com/images/pos-banner.png?t=1",
                        //     title : "--",
                        //     address : "--"
                        // }
                        ////
                        // me.pr(f);
                    }else{
                        $(document).trigger("onShopError",[r]);
                    }
                });
                return me;
            }

            me.post(site_url_ajax("api/setting/pr/"),{},function(r){
                abc(me,r,f);
            });
            return me;
        };
        
        
     })() 
  };
})(window);
    
      
      function LoadCSS(e){return new Promise(function(n,t){var o=document.createElement("link");o.rel="stylesheet",o.href=e,document.head.appendChild(o),o.onload=function(){n(),console.log("CSS has loaded!")}})}function LoadJS(e){return new Promise(function(n,t){var o=document.createElement("script");o.type="text/javascript",o.src=e,document.head.appendChild(o),o.onload=function(){n(),console.log("JS has loaded!")},o.onerror=function(){}})}

var host = document.location.host;
var root = "/build/";
// var root = host.includes(".byethost")?"https://"+host+"/":"/v1/shopprofile/assets/";
window.addEventListener("load", (event) => {
  document.querySelector(".imgbox").innerHTML =`<img src="${AppRequest.logo()}" width="125" alt="">`

 

     
    // LoadCSS(root+"mine.min.css?t="+Date.now()).then(function(){
       LoadJS(root+"mine.min.js?i=1&t="+Date.now()).then(function(){ 

        $(document).on("onShopError",function(e,msg){

            alert(msg.error);
        });

        AppRequest.ready(function(){
            LoadJS("https://data.donggiatri.com/user.sdk.js?t=4343w53").then(function(){
          
             userSDK.getAuth().then(function(v){
              user = v;
              // alert(23432);
              if(v){
                var data = {barcode:v.barcode};
                console.log(data);
                 //try to send phone to check status for this user center
                AppRequest.config(data,function(auth){
                    if(!auth||auth.code==0){
                        var v = AppRequest.getUser();
                        var str=`<div class="msgicon pageproduct">
                          <div class="flex-col center">
                               
                              <div class='flex'>
                                    <p>Khách hành thân thiết</p>
                                    <form>
                                         <div style="min-height:250px">
                                         <div style="text-align:center;">
                                            <img src="${v.avatar}" onerror="this.src='https://cdn-icons-png.flaticon.com/128/3940/3940417.png'" width="75" height="75" style="display: inline-block;margin: 16px auto;border-radius: 50%;" />
                                         </div>
                                        <div class="lr">
                                          <span>Họ và tên</span>
                                          <span>${v.fullname||v.username}</span>
                                        </div>
                                         <div class="lr">
                                          <span>Email</span>
                                          <span>${v.email}</span>
                                        </div>
                                         <div class="lr">
                                          <span>Địa chỉ</span>
                                          <span>${v.address}</span>
                                        </div>
                                      </div>
                                    </form>
                                    <div class="msg"></div>  
                              </div>
                           </div>
                        </div>`;
                            var methods = tools();
                            
                            var settings={ 
                                title : "Đồng bộ tài khoản",
                                message :str,
                                callback : function(dialog,ok){

                                    if(ok){
                                        methods.info("Đang xử lý...");
                                        AppRequest.post("api/customer/register/",v,function(r){
                                            methods.hide();
                                            if(r.code){
                                                if(r.passkey){
                                                    AppConfig = $.extend(AppConfig,r,true);
                                                }else{
                                                    //now wait user for activate link
                                                }

                                                bootbox.hideAll();
                                            }
                                        });
                                    } 
                                }
                            };
                            alertDialog(settings).then(function(dialog){
                                methods.$ = dialog;
                 
                        });
                    }
                });
     
              }
           });
            userSDK.miss(function(list){
                var abc =  Object.values(list)[0];
                updateuser(abc,function(data){

                });
            });
        });
    });


         //{{coupon code "date"}}
            Handlebars.registerHelper('coupon', function (code,date) {
               if(!code)return "";
               date = date||"30 April 2026";

                return new Handlebars.SafeString(`<div class="cardbox">
                <div class="main">
                  <div class="coupon-rate">
                    <h1>1000€</h1>
                  </div>
                  <div class="vertical"></div>
                  <div class="content">
                    <h2>${code}</h2>
                    <p>Valid till ${date}</p>
                  </div>
                </div>
                <div class="copy-button">
                  <p>Valid for this contract globally !</p>
                  <button onclick="copyIt()" class="copybtn">USE IT !</button>
                </div>
              </div>`);
            });
             
          AppRequest.cache(function(){
              var color =  AppRequest.cache.storage("_theme")||"default";
           $("body").attr("data-color",color);
          });

          //load language
          if(window.initLanguage)initLanguage();
          

          main();
          
 

          $("body").addClass("loaded");
         
       });
    });


// });


function main(){

     var slides =[
        {
            image:"https://blog.dktcdn.net/files/top-phan-mem-quan-ly-ban-hang-mien-phi-tot-nhat-hien-nay.png",
            content:`<h2>Quản lý cửa hàng từ xa hiệu quả</h2>
            <p>30 biểu đồ báo cáo chi tiết hoạt động kinh doanh, chi phí lãi lỗ, hàng tồn kho được gửi tới điện thoại của quản lý theo thời gian thực. Giúp bạn kiểm soát cửa hàng mọi lúc, mọi nơi ngay cả khi vắng mặt một cách tốt nhất</p>`
        },
        {
            image:"https://blog.dktcdn.net/files/quan-ly-ban-hang-mien-phi-1.png",
            content:`<h2>Quản lý hàng tồn kho dễ dàng.</h2>
            <p> Quản lý hàng hoá theo mẫu mã, kích thước, mã vạch. Quản lý chặt chẽ các hoạt động nhập – xuất kho, kiểm soát công nợ khách hàng tốt nhất</p>`
        },
        {
            image:"https://blog.dktcdn.net/files/quan-ly-ban-hang-mien-phi-2.png",
            content:` <h2>Quản lý nhân viên chặt chẽ.</h2>
            <p>Hỗ trợ quản lý và phân quyền cho nhân viên chặt chẽ. Giúp hạn chế tối đa vấn đề thất thoát, gian lận của nhân viên</p>`
        },
        {
            image:"https://blog.dktcdn.net/files/quan-ly-ban-hang-mien-phi-4.jpg",
            content:`<h2>Quản lý khuyến mãi, khách hàng.</h2>
            <p>Tạo và quản lý các chương trình khuyến mãi như giảm giá, tặng kèm sản phẩm… Lưu trữ thông tin khách hàng theo họ tên, số điện thoại, lịch sử mua hàng nhằm hỗ trợ chiến lược chăm sóc, bán hàng upsell sau này</p>`
        },
        {
            image:"https://blog.dktcdn.net/files/quan-ly-ban-hang-mien-phi-5.jpg",
            content:`<h2>Quản lý chuỗi cửa hàng.</h2>
            <p>Quản lý toàn bộ hoạt động kinh doanh của các chi nhánh trong toàn hệ thống một cách hiệu quả trên 1 tài khoản quản lý duy nhất!</p>`
        } 
    ];

    $("body").append(`<div class="login-container">
  
  <div  class="login-form" >
    
     <input type="hidden" name="_token" value="$2y$10$lsZGKOIY6NU47gW9.DMIx.ZinE2F9J3hnrYcU5O2oPNj.Yd2eM0Ta" />    
     <div class="infoshop">
        <div class="bannerbg" style="background-image: url(${appconfig.banner});">
        <div class="logo">
        <img style="border-radius: 50%;" src="${appconfig.logo}" width="75" height="75" alt="">
        </div>

        <div class="action-right">
          <div class="item" data-target="#RegisterCTV" data-toggle="modal">
              <img src="https://cdn-icons-png.flaticon.com/128/4834/4834038.png" width=12 height=12 alt="">
               
           </div>
           <div class="item openCart">
              <img src="https://cdn-icons-png.flaticon.com/128/4290/4290854.png" width=12 height=12 alt="">
              <span class="badge"></span>
           </div>
           <div class="item" onclick='AppRequest.share()'>
              <img src="https://cdn-icons-png.flaticon.com/128/1828/1828874.png" width=12 height=12 alt=""> 
           </div>
        </div>
    </div>
        
        <div class="flex-row">
             <div class="infos flex">
            <div style="border-radius: 8px;"> <strong class="shopname">${appconfig.title}</strong>  </div>
            <div class="address">${appconfig.address}</div>
        </div>
        <div class="actions text-center flex-row">
            <div>
                <p>&nbsp;</p>
                <a class="btnphone"><i class="fa fa-phone" aria-hidden="true"></i></a>
            </div>
           <div data-target="ShopComment" data-toggle="modal">
               <p>10</p>
              <p><i class="fas fa-comments" aria-hidden="true"></i></p>
           </div>
           <div class="ShopChat">
               <p>&nbsp</p>
              <p><img src="https://cdn-icons-png.flaticon.com/128/234/234148.png" width="24"></p>
           </div>
        </div>
        </div>
     </div>
       
     <div class="login-form-inner">
      
        
           <ul class="nav nav-pills scrollable mainmenu" role="tablist" data-tabs="tabs">
           <li class="active"><a href="#shopmenu" data-toggle="tab">Sản phẩm</a></li>
           <li><a href="#shopinfor" data-toggle="tab">Thông tin</a></li>
           <li><a href="#shopdisccount" data-toggle="tab">Giảm giá</a></li>
            
           </ul>
           <div class="tab-content">
              <div role="tabpanel" class="tab-pane fade in active h100" id="shopmenu">
                
                <div class="flex-col h100 groupone">
                    <div  class="groupcate groupactive"></div>
                    <div class="groupproduct">
                        <div class="infooutlet">
                      
                        </div> 
                        <div class="menus"></div>
                    </div> 
                </div>
                
              </div>
              <!--  -->
             <div role="tabpanel" class="tab-pane fade" id="shopinfor">
               <p class="phead">Thông tin</p>
               <div class="description white-view" style="min-height: 100px;">
                 <p>Đang cập nhật</p>
               </div>
               <div class="branchs white-view">
                 <p class="phead">Chi nhánh</p>
                 <div class="list scrollable">
                    <p>Đang cập nhật</p>
                 </div>
               </div>

               <div class="white-view" style="min-height: 100px;">
                <p>Bản đồ</p>
                  <div class="mapbox">
                   <p>Đang cập nhật</p>

                    </div>
               </div>
               <!--  -->
               <div>
                <p>Một số hình ảnh cửa hàng</p>
                  <div class="galleries">
                   <p>Đang cập nhật</p>

               </div>
               </div>
               
             </div>
              <!--  -->
             <div role="tabpanel" class="tab-pane fade" id="shopdisccount">
               <p>Đang cập nhật</p>
             </div>
              <!--  -->
             <!-- <div role="tabpanel" class="tab-pane fade" id="shopaccount" style="    height: 100%;display: flex;flex-direction: column;justify-content: space-between;">
                <div class="nouser" style="display:none">
                   <p>Bạn chưa đăng nhâp</p>

                   <button class="btn btn-primary btnregister" data-acc="Login">Đăng ký ngay</button>
                </div>
                <div class="hasuser" style="display:none">
                   
                   
                   
                </div> 
                <div>
                   <img src="https://tpc.googlesyndication.com/simgad/14201389944695667541?sqp=4sqPyQQ7QjkqNxABHQAAtEIgASgBMAk4A0DwkwlYAWBfcAKAAQGIAQGdAQAAgD-oAQGwAYCt4gS4AV_FAS2ynT4&rs=AOga4qnCc1YsoQIXAk2-f6PQmOtQuCxMHw" alt="">
                </div>
             </div> -->
             <!--  -->
           </div>
      
      
 
       
      
    </div>


    <div class="infocart">
      <div class="flex-row">
         <div>
           <span>TC: <span class="total">0</span> - <span class="money">0</span></span>
         </div>
         <div class="btnpay" data-target="#ReviewOrder">
           Thanh toán
         </div>
      </div>
    </div>
    
     
      
 

  </div>
  <div class="onboarding">
    <div class="swiper-container">
      <div class="swiper-wrapper">
        
         ${slides.map(function(v,index){
            return `<div class="swiper-slide color-${index+1}">
                <div class="slide-image">
                    <img src="${v.image}" loading="lazy" alt="" />
                  </div>
                  <div class="slide-content">
                        ${Handlebars.compile(v.content)({})}
                  </div> 
            </div>`;
         }).join("")} 
      </div>
      <!-- Add Pagination -->
      <div class="swiper-pagination"></div>
    </div>
  </div>
</div>
<ul class=" tabsmenu tab groupactive"> 
    <li class="active"><i class="fa fa-home" aria-hidden="true"></i> <span>Trang chủ</span></li>

    <li data-acc="MyNotification"><i class="fa fa-bell-o" aria-hidden="true"></i> <span> Thông báo</span></li>

    

    <li class="qrcode btnqrcode"><i class="fa fa-qrcode" aria-hidden="true"></i><span></span></li>
    <li data-acc="Orders"><i class="fa fa-first-order" aria-hidden="true"></i><span>Đơn hàng</span></li>

    <li  data-acc="MyAccount"><i class="fa fa-user-o" aria-hidden="true"></i><span>Tài khoản</span></li>

</ul>`);
    //begin 
  AppRequest.pr(function(){
     $("body").addClass("loaded");
     $(".screen_box").remove();
     
  });
     var user = null;


     AppRequest.ready(function(config){
        $(".btnphone").attr("href",`tel:`+config.setting.pr.phone);
     });

 
   
}

function pickerProduct(options){
    options=$.extend({},options,true);



    var str=`<div class="msgicon pageproduct">
      <div class="flex-col center">
           
          <div class='flex'>
                
                <form>
                    <div class="headproduct">
                        <div class="imgblock">
                            <div class="bg" style="background-image:url(${options.data.image})"></div>
                        </div>
                       <div class="mtb-8 priceblock lr"> 
                            <div>
                                <strong class="font-30">Giá: ${show_money_none(options.data.price||0)}</strong>
                            </div>
                            <div>
                            </div>
                       </div>
                    </div>
                    <div class="bodyproduct">
                        <div class="description">
                            ${options.data.description||options.data.desc||"Đang cập nhật..."}
                        </div>
                    </div>
                </form>
                <div class="msg"></div>  
          </div>
       </div>
    </div>`;
            var methods = tools();
            
            var settings={ 
                title : options.data.title||options.data.name,
                textYes: "Thêm vào giỏ hàng",
                message :str,
                callback : function(dialog,ok){

                    if(ok){
                        
                    }
                   
                    bootbox.hideAll();
                }
            };
             alertDialog(settings).then(function(dialog){
                methods.$ = dialog;
 

                var process = function(data){
                    dialog.bindData(data);
                    settings.data = data;

                    //check image or gallery
                    try{
                        data.gallery = JSON.parse(data.gallery);
                    }catch(eee){
                        dialog.find(".imgblock").html(`<div class="bg" style="background-image:url(${data.image})"></div>`)
                    }
                    if(data.gallery&&data.gallery.length){
                       Swipper.Horizontal({
                        data : data.gallery,
                        ele: dialog.find(".imgblock"),
                        renderItem : function(item){
                            return `<div class="bg" style="background-image:url(${item})"></div>`;
                        },
                        renderThumbnailItem : function(item){
                            return `<div class="bg" style="background-image:url(${item})"></div>`;
                        },
                        slideChange : function(){

                        }
                       });
                    }
                    //tabs
                };

                 
                methods.info("Đang xử lý...");
                //load san pham
                AppRequest.post('api/product/detail/',{id:options.data.barcode},function(r){
                    methods.hide();
                    if(r.code){
                        process(r.data);
                    }else{
                        methods.empty(); 
                    }
                });
                
              });
}


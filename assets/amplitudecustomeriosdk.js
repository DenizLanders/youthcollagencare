var api_key = '10338a452d6d16530a745fdd55f0926a';
const api_url = 'https://try.seriousskincare.com/it/';
var previousemail = null;
var customer_previousemail = null;

function genCuid() {
    // Uses import from https://unpkg.com/cuid@2.1.8/dist/cuid.min.js
    return cuid();
}

function addPackgInTracking(){
   const __campaignId= document.querySelector('.chk-pkg.active')?.dataset?.campaign;
   if(typeof __campaignId!=="undefined"){
     let link = new URL(window.location.href);
     link.searchParams.set("packageid", __campaignId);
       window.history.replaceState(null, null, link);
   }
}

function getCustomerUUID() {
    if (localStorage.getItem('tgb_userid') && localStorage.getItem('tgb_userid')!=='null') {
        return localStorage.getItem('tgb_userid');
    }
    let sgenCuid = genCuid();
    localStorage.setItem('tgb_userid', sgenCuid);
    return sgenCuid;
}

function getCustomerEmail() {
    if (localStorage.getItem('ss_email')) {
        return localStorage.getItem('ss_email');
    }
    return null;
}


function setUserDetail(user_id = null) { 
 let ss_user_id = amplitude.getInstance().options?.userId;
  let ss_device_id = amplitude.getInstance().options?.deviceId;
  let ss_session_id = amplitude.getInstance()?._sessionId;
  if (typeof ss_user_id !== "undefined") {
    ss_user_id = localStorage.setItem('tgb_userid', ss_user_id);
  }
  if (user_id !== null) {
    ss_user_id = localStorage.setItem('tgb_userid', user_id);
  }
  if (typeof ss_device_id !== "undefined" && ss_device_id !== "test") {
    ss_device_id = localStorage.setItem('ss_device_id', ss_device_id);
  }
  if (typeof ss_session_id !== "undefined") {
    ss_session_id = localStorage.setItem('ss_session_id', ss_session_id);
  }

}

function getUserDetail() {
    let ss_user_id = amplitude.getInstance().options?.userId;
  let ss_device_id = amplitude.getInstance().options?.deviceId;
  let ss_session_id = amplitude.getInstance()?._sessionId;
  if (ss_user_id === null || typeof ss_user_id === "undefined") {
    ss_user_id = localStorage.getItem('tgb_userid');
  }
  if (ss_device_id === null || typeof ss_device_id === "undefined"|| ss_device_id === "test") {
    ss_device_id = localStorage.getItem('ss_device_id');
  }
  if (ss_session_id === null || typeof ss_session_id === "undefined") {
    ss_session_id = localStorage.getItem('ss_session_id');
  }
  return {
    user_id: ss_user_id,
    device_id: ss_device_id,
    session_id: ss_session_id,
  };
}

function __emailEntered(email, cb, funnelId = null, variantId = null) {
    amplitudeEmailEnteredGraphQl(email, cb, funnelId, variantId);
    //  customerioEmailEntered(email, funnelId, variantId);
}
function __checkoutstarted(itemdata) {
    amplitudeCheckoutstarted(itemdata);
    //customerioCheckoutstarted(itemdata);
}
function __checkoutview(itemdata) {
    amplitudeCheckoutviewed(itemdata);
    //customerioCheckoutviewed(itemdata);
}
function __funnelview(funnelId, variantId = null) {
    amplitudeFunnelviewed(funnelId, variantId);
    //customerioFunnelviewed(funnelId, variantId);
}
function __upsellview(crmId, funnelId, variantId = null) {
    amplitudeUpsellviewed(crmId, funnelId, variantId);
    //customerioUpsellviewed(crmId, funnelId, variantId);
}

function __upsellAccepted(step) {
    amplitude.getInstance().logEvent('Upsell Accepted', { step })
}

function __pageviewserverEvent() {
  setUserDetail();
  let data = {
    path: window.location.pathname,
    URL: window.location.href,
    title: document.title,
    referrer: document.referrer,
    domain: window.location.host
  }
  amplitudeSentEvent('Page Viewed - Server', data);
 // customerioSentEvent('Page Viewed - Server', data);
}

function amplitudeIdentify(first_name, last_name, email) {
    const params = new URLSearchParams(location.search);
    let paramObj = {};
    for (var value of params.keys()) {
        paramObj[value] = params.get(value);
    }
    //amplitude.getInstance().setUserId(getCustomerUUID());

    amplitude.getInstance().setUserProperties({
        email: email,
        firstName:first_name,
        lastName:last_name,
        trackingParameters: paramObj
    })
}

function amplitudeIdentifyThankyou(customerid, first_name, last_name) {
    // amplitude.getInstance().setUserId('ano_' + getCustomerUUID());
    const identify = new amplitude.Identify()
    identify.set("customerid", customerid)
    identify.set("firstName", first_name)
    identify.set("lastName", last_name)
    amplitude.getInstance().identify(identify);

}



function getCustomerUserId(email, cb) {

    var data = {
        action: 'amplitude',
        method: 'callCustomerId',
        email: email
    }

    $.ajax({
        url: 'https://try.seriousskincare.com/it/trakingevents.php',
        type: 'POST',
        dataType: 'json',
        action: 'amplitude',
        data: data,
        success: function (resp) {
            cb(resp);
        }
    });
}



function amplitudeCheckoutviewed(itemdata) {
    const params = new URLSearchParams(location.search);
    let paramObj = {};
    for (var value of params.keys()) {
        paramObj[value] = params.get(value);
    }
    let { user_id, session_id, device_id } = getUserDetail();
    var data = {
        api_key,
        action: 'amplitude',
        method: 'checkoutview',
        events: [
            {
                event_type: "Checkout Viewed - Server",
                user_id,
                session_id,
                device_id,
                event_properties: {
                    skus: itemdata.skus,
                    funnelId: itemdata.funnelId,
                    path: window.location.pathname,
                    URL: window.location.href,
                    domain: window.location.host,
                    variantId: itemdata.variantId ? itemdata.variantId : 'index-a',
                    crmProductId: itemdata.crmProductId,
                    trackingParameters: paramObj
                }
            }
        ],
    }
    if (itemdata.variantId) {
        data['events'][0]['event_properties']['variantId'] = itemdata.variantId;
    }

    $.ajax({
        url: api_url + 'trakingevents.php',
        type: 'POST',
        dataType: 'json',
        action: 'amplitude',
        data: data,
        success: function (resp) {
            console.log('Checkout Viewed - Server : ', resp)
        }
    });
}



function amplitudeFunnelviewed(funnelId, variantId = null) {
    const params = new URLSearchParams(location.search);
    let paramObj = {};
    for (var value of params.keys()) {
        paramObj[value] = params.get(value);
    }
    let { user_id, session_id, device_id } = getUserDetail();
    var data = {
        api_key,
        action: 'amplitude',
        method: 'funnelview',
        events: [
            {
                event_type: "Lander Viewed - Server",
                user_id,
                session_id,
                device_id,
                event_properties: {
                    funnelId: funnelId,
                    path: window.location.pathname,
                    URL: window.location.href,
                    domain: window.location.host,
                    variantId: variantId ? variantId : 'index-a',
                    trackingParameters: paramObj
                }
            }
        ],
    }

    $.ajax({
        url: api_url + 'trakingevents.php',
        type: 'POST',
        dataType: 'json',
        data: data,
        success: function (res) {
            console.log('Lander Viewed - Server : ', res)
        }
    });
}

function amplitudeUpsellviewed(crmId, funnelId, variantId = null) {
    const params = new URLSearchParams(location.search);
    let paramObj = {};
    for (var value of params.keys()) {
        paramObj[value] = params.get(value);
    }
    let { user_id, session_id, device_id } = getUserDetail();
    var data = {
        api_key,
        action: 'amplitude',
        method: 'upsellview',
        events: [
            {
                event_type: "Cross-Sell Viewed - Server",
                user_id,
                session_id,
                device_id,
                event_properties: {
                    funnelId: funnelId,
                    path: window.location.pathname,
                    URL: window.location.href,
                    domain: window.location.host,
                    variantId: variantId ? variantId : 'index-a',
                    crmCrossSellId: crmId, //Funnels Only - string - product’s Sticky id
                    trackingParameters: paramObj
                }
            }
        ],
    }

    $.ajax({
        url: api_url + 'trakingevents.php',
        type: 'POST',
        dataType: 'json',
        data: data,
        success: function (resp) {
            console.log('Cross-Sell Viewed - Server : ', resp)
        }
    });
}


function amplitudeEmailEnteredGraphQl(email, cb, funnelId = null, variantId = null) {
    if (previousemail === email) {
        return;
    }
    previousemail = email;
    

    getCustomerUserId(email, function (id) {

        console.log(id);
        if (id === null) {
            return;
        }

        let paramObj = {};
        // localStorage.setItem('ss_userid', getCustomerUUID());
        // localStorage.setItem('ss_email', email);

        localStorage.setItem('tgb_userid', id);
        localStorage.setItem('ss_email', email);

        for (var value of params.keys()) {
            paramObj[value] = params.get(value);
        }

        amplitude.getInstance().setUserId(id);

        amplitude.getInstance().logEvent(
            'Email Entered',
            {
                email,
                funnelId,
                variantId,
                path: window.location.pathname,
                URL: window.location.href,
                domain: window.location.host,
                trackingParameters: paramObj
            },
        )
        console.log('Email Entered');
        sendAmpUserDetail(id);
        //   customerioEmailEntered(email, funnelId, variantId);
        cb(id);

    });

}


function sendAmpUserDetail(userid = null) {
    let { user_id, session_id, device_id } = getUserDetail();
    var data = {
        action: 'amplitude',
        method: 'setuserdetail',
        events: [
            {
                user_id: userid ? userid : amplitude.getInstance().options?.userId,
                session_id,
                device_id
            }
        ],
    }


    $.ajax({
        url: api_url + 'trakingevents.php',
        type: 'POST',
        dataType: 'json',
        action: 'amplitude',
        data: data,
        success: function (resp) {
            console.log('Save user detail : ', resp)
        }
    });
}


function amplitudeCheckoutstarted(itemdata) {
    sendAmpUserDetail();
    const params = new URLSearchParams(location.search);
    let paramObj = {};
    for (var value of params.keys()) {
        paramObj[value] = params.get(value);
    }
    amplitude.getInstance().setUserId(getCustomerUUID());

    // amplitude.getInstance().logEvent(
    //     'Checkout Started',
    //     {
    //         ...itemdata,
    //         domain: window.location.host,
    //         trackingParameters: paramObj
    //     },
    // )
    // console.log('Checkout Started');
    let { user_id, session_id, device_id } = getUserDetail();
    var data = {
        api_key,
        action: 'amplitude',
        method: 'upsellview',
        events: [
            {
                event_type: "Checkout Started",
                // user_id: getCustomerUUID(),
                user_id,
                session_id,
                device_id,
                event_properties: {
                    ...itemdata,
                    products:Array.isArray(itemdata.products) &&itemdata.products.length===1 ? itemdata.products[0] : itemdata.products,
                    couponCode:'N/A',
                    path: window.location.pathname,
                    URL: window.location.href,
                    domain: window.location.host,
                    variantId: itemdata.variantId ? itemdata.variantId : 'index-a',
                    trackingParameters: paramObj
                }
            }
        ],
    }

    $.ajax({
        url: api_url + 'trakingevents.php',
        type: 'POST',
        dataType: 'json',
        data: data,
        success: function (resp) {
            console.log('Checkout Started : ', resp)
        }
    });
}


function amplitudeProductView(itemdata) {
    const params = new URLSearchParams(location.search);
    let paramObj = {};
    for (var value of params.keys()) {
        paramObj[value] = params.get(value);
    }
    // amplitude.getInstance().setUserId(getCustomerUUID())

    amplitude.getInstance().logEvent(
        'Product Viewed',
        {
            ...itemdata,
            domain: window.location.host,
            trackingParameters: paramObj
        },
    )
    console.log('Product Viewed');
}


function amplitudeEmailEntered(email, funnelId = null, variantId = 'index-a') {
    if (previousemail === email) {
        return;
    }

    previousemail = email;
    const params = new URLSearchParams(location.search);
    let paramObj = {};
    for (var value of params.keys()) {
        paramObj[value] = params.get(value);
    }

    amplitude.getInstance().setUserId(getCustomerUUID());

    amplitude.getInstance().logEvent(
        'Email Entered',
        {
            email,
            funnelId,
            path: window.location.pathname,
            URL: window.location.href,
            domain: window.location.host,
            variantId: variantId,
            trackingParameters: paramObj
        },
    )
    console.log('Email Entered');
}


///customer io


function customerIdentify(first_name, last_name, email) {
    const params = new URLSearchParams(location.search);
    let paramObj = {};
    for (var value of params.keys()) {
        paramObj[value] = params.get(value);
    }
    _cio.identify({
        id: getCustomerUUID(),   // Unique id for the currently signed in user in your application.
        email: email,  // Email of the currently signed in user.
        first_name,
        last_name,
        created_at: Math.round((new Date).getTime() / 1000),
        trackingParameters: paramObj
    });
}

function customerIdentifyThankyou(customerId, annoid, firstName, lastName, email) {
    // _cio.identify({
    //     id: 'cio_' + getCustomerUUID(),
    //     customerId,
    //     //  email,
    //     // anonymous_id: annoid,
    //     firstName,
    //     lastName
    // });
}


function customerioCheckoutviewed(itemdata) {
    const params = new URLSearchParams(location.search);
    let paramObj = {};
    for (var value of params.keys()) {
        paramObj[value] = params.get(value);
    }
    var data = {
        name: "Checkout Viewed - Server",
        action: 'customerio',
        method: 'checkoutview',
        anonymous_id: getCustomerUUID(),
        id: 'cio_' + getCustomerUUID(),
        data: {
            skus: itemdata.skus,
            funnelId: itemdata.funnelId,
            path: window.location.pathname,
            URL: window.location.href,
            domain: window.location.host,
            variantId: itemdata.variantId ? itemdata.variantId : 'index-a',
            crmProductId: itemdata.crmProductId,
            trackingParameters: paramObj
        }
    }
    if (itemdata.variantId) {
        data['data']['variantId'] = itemdata.variantId;
    }
    _cio.track(data['name'], data['data']);
    // $.ajax({
    //     url: api_url + 'trakingevents.php',
    //     type: 'POST',
    //     dataType: 'json',
    //     data: data,
    //     success: function (resp) {
    //         console.log('Checkout Viewed - Server : ', resp)
    //     }
    // });
    console.log('Checkout Viewed - Server');
}


function customerioFunnelviewed(funnelId, variantId = null) {
    const params = new URLSearchParams(location.search);
    let paramObj = {};
    for (var value of params.keys()) {
        paramObj[value] = params.get(value);
    }
    var data = {
        name: "Lander Viewed - Server",
        action: 'customerio',
        method: 'funnelview',
        anonymous_id: getCustomerUUID(),
        id: 'cio_' + getCustomerUUID(),
        data: {
            funnelId: funnelId,
            path: window.location.pathname,
            URL: window.location.href,
            domain: window.location.host,
            variantId: variantId,
            domain: window.location.host,
            trackingParameters: paramObj
        }
    }
    _cio.track('Lander Viewed - Server', data['data']);
    // $.ajax({
    //     url: api_url + 'trakingevents.php',
    //     type: 'POST',
    //     dataType: 'json',
    //     data: data,
    //     success: function (resp) {
    //         console.log('Funnel Viewed - Server : ', resp)
    //     }
    // });
    console.log('Lander Viewed - Server ');
}


function customerioUpsellviewed(crmId, funnelId, variantId = null) {
    const params = new URLSearchParams(location.search);
    let paramObj = {};
    for (var value of params.keys()) {
        paramObj[value] = params.get(value);
    }
    var data = {
        name: "Cross-Sell Viewed - Server",
        action: 'customerio',
        method: 'upsellview',
        anonymous_id: getCustomerUUID(),
        id: 'cio_' + getCustomerUUID(),
        data: {
            funnelId: funnelId,
            variantId,
            path: window.location.pathname,
            URL: window.location.href,
            domain: window.location.host,
            variantId: variantId,
            crmCrossSellId: crmId, //Funnels Only - string - product’s Sticky id
            trackingParameters: paramObj
        }
    }

    $.ajax({
        url: api_url + 'trakingevents.php',
        type: 'POST',
        dataType: 'json',
        data: data,
        success: function (resp) {
            console.log('Cross-Sell Viewed - Server : ', resp)
        }
    });
}

function customerioEmailEntered(email, funnelId = null, variantId = 'index-a') {
    if (customer_previousemail === email) {
        return;
    }

    customer_previousemail = email;
    const params = new URLSearchParams(location.search);
    let paramObj = {};
    for (var value of params.keys()) {
        paramObj[value] = params.get(value);
    }
    var data = {
        email,
        funnelId,
        path: window.location.pathname,
        URL: window.location.href,
        domain: window.location.host,
        variantId: variantId,
        trackingParameters: paramObj
    }
    _cio.identify({
        anonymous_id: getCustomerUUID(),
        id: 'cio_' + getCustomerUUID(),
        created_at: Math.round((new Date).getTime() / 1000),
    });
    _cio.track('Email Entered', data);
    _cio.identify({
        id: 'cio_' + getCustomerUUID(),
        email
    });
    console.log('Email Entered');

}

function customerioCheckoutstarted(itemdata) {
    const params = new URLSearchParams(location.search);
    let paramObj = {};
    for (var value of params.keys()) {
        paramObj[value] = params.get(value);
    }
    var data = {
        ...itemdata,
         products:Array.isArray(itemdata.products) ? itemdata.products[0] : itemdata.products,
        couponCode:'N/A',
        path: window.location.pathname,
        URL: window.location.href,
        domain: window.location.host,
        variantId: itemdata.variantId ? itemdata.variantId : 'index-a',
        trackingParameters: paramObj
    }

    _cio.track('Checkout Started', data);
    _cio.identify({
        id: 'cio_' + getCustomerUUID(),
        ...itemdata
    });

    console.log('Checkout Started');

}

function customeriooProductView(itemdata) {
    const params = new URLSearchParams(location.search);
    let paramObj = {};
    for (var value of params.keys()) {
        paramObj[value] = params.get(value);
    }
    var data = {
        ...itemdata,
        domain: window.location.host,
        trackingParameters: paramObj
    }
    _cio.track('Product Viewed', data);
    // _cio.identify({
    //     id: getCustomerUUID(),
    //     anonymous_id: getCustomerUUID(),
    // });
    console.log('Product Viewed');

}

function amplitudeSentEvent(event_name, data) {
  let { user_id, session_id, device_id } = getUserDetail();
  var __data = {
    api_key,
    action: 'amplitude',
    method: 'sendevent',
    events: [
      {
        event_type: event_name,
        user_id,
        session_id,
        device_id,
        event_properties: data
      }
    ],
  }

  $.ajax({
    url: api_url + 'trakingevents.php',
    type: 'POST',
    dataType: 'json',
    action: 'amplitude',
    data: __data,
    success: function (resp) {
      console.log(event_name, resp);
    }
  });
  // amplitude.getInstance().logEvent(
  //   event_name,
  //   data
  // )
  // console.log(event_name);
}

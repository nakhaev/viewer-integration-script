(function() {
    function Vw() {

        var defaultConfig = {
            width: '100%',
            height: '750px',
            frameBorder: '0',
        };

        var pattern = '^((ht|f)tp(s?))\://([0-9a-zA-Z\-]+\.)+[a-zA-Z]{2,6}(\:[0-9]+)?(/\S*)?$';

        function registerHandlers(config) {
            // get origin from the config.frameSrc
            var origin = null;

            try {
                origin = new URL(config.frameSrc).origin;
            } catch (error) {
                origin = config.frameSrc.slice(0, config.frameSrc.indexOf('viewer')-1);
                console.log(error);
            }

            if(origin) console.log('Set "origin" as: ', origin);

            // subscribe on the "message" event and set handlers
            window.addEventListener('message', function (event) {
                if(event && event.origin && event.origin === origin) {
                    // try to parse data
                    var data = null;
                    try {
                        data = JSON.parse(event.data);
                    } catch (error) {
                        console.log(error);
                    }
                    // choose the handler by data type
                    if(data) {
                        var type = data.type || '';
                        var payload = data.payload || '';

                        switch(type) {
                            default: console.log('Unexpected data type: ', type);
                                break;
                            case 'LOAD_FORM': if(config.loadFormHandler) config.loadFormHandler(payload);
                                break;
                            case 'NEXT': if(config.nextHandler) config.nextHandler(payload);
                                break;
                            case 'SAVE_NEXT': if(config.saveAndNextHandler) config.saveAndNextHandler(payload);
                                break;
                            case 'FINISH': if(config.finishHandler) config.finishHandler(payload);
                                break;
                            case 'ONE_MORE': if(config.oneMoreHandler) config.oneMoreHandler(payload);
                                break;
                            case 'GO_BACK': if(config.goBackHandler) config.goBackHandler(payload);
                                break;
                            case 'RELOAD': if(config.reloadHandler) config.reloadHandler(payload);
                                break;
                        }
                    } else {
                        console.log('The data was not received ', data);
                    }
                }
            });
        }

        function insertViewerWidget(config) {
            // get parent element by Id
            var parent = window.document.getElementById(config.parentId);

            // prepare URL
            let url = String(config.frameSrc);
            // NOTE appKey checking will be implemented in future
            // if(config.appKey) {
            //     url += (url.indexOf('?') != -1 ? '&' : '?') + 'appKey=' + String(config.appKey);
            // }
            if(config.authToken) {
                url += (url.indexOf('?') != -1 ? '&' : '?') + 'authToken=' + String(config.authToken);
            }
            if(config.displayInfoHeader) {
                url += (url.indexOf('?') != -1 ? '&' : '?') + 'displayInfoHeader=' + String(config.displayInfoHeader);
            }

            //URL validation
            var regex = new RegExp(pattern, 'gm');

            if(!regex.test(url)) {
                var message = 'URL is invalid. URL: ' + url;
                throw Error(message);
            }

            // create iframe
            var embedded = window.document.createElement('iframe');
            // determine width of iframe
            embedded.width = config.width || defaultConfig.width;
            // determine height of iframe
            embedded.height = config.height || defaultConfig.height;
            // determine border width for iframe
            embedded.frameBorder = config.frameBorder || defaultConfig.frameBorder;
            // determine 'src' attribute for iframe
            embedded.setAttribute('src', url);
            // determine 'id attribute for iframe if it is exist
            if(config.frameId) embedded.setAttribute('id', config.frameId);

            // delete existing iframe - for reinitialization on fly
            parent.innerHTML = "";
            // insert embedded viewer widget into parent element
            parent.appendChild(embedded);
        }

        this.init = function (config) {
            // verification fo the required fields
            if(!config) throw Error('Config is not exist!');
            
            let src = String(config.frameSrc);
            //SRC validation
            var regex = new RegExp(pattern, 'gm');

            if(!regex.test(src)) {
                var message = 'frameSrc is invalid. frameSrc: ' + src;
                throw Error(message);
            }

            registerHandlers(config);
            insertViewerWidget(config);
            console.log('viewer widget initialized successfully!');
            // console.log('config', config);
        }
    }

    return window.vw = new Vw();
})();
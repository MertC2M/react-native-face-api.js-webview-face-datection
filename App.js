import React, {Component} from 'react';
import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    Text,
    TouchableOpacity,
    PermissionsAndroid,
    Platform,
    Dimensions,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';

const screenHeight = Math.round(Dimensions.get('window').height);

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isFaceDetectionActive: false,
        };
    }

    componentDidMount() {
        this.initPermissions();
    }

    componentWillUnmount() {

    }

    startFaceDetection = () => {
        this.setState({isFaceDetectionActive: true});
    };

    initPermissions = async () => {
        if (Platform.OS === 'android') {
            let permissions = [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];
            permissions.push(PermissionsAndroid.PERMISSIONS.CAMERA);
            const granted = await PermissionsAndroid.requestMultiple(permissions);
            const recordAudioGranted = granted['android.permission.RECORD_AUDIO'] === 'granted';
            const cameraGranted = granted['android.permission.CAMERA'] === 'granted';
            if (!recordAudioGranted || !cameraGranted) {
                return;
            }
        } else {
            let hasCamera = false;
            let hasMicrophone = false;
            let cameraPermission = await check(PERMISSIONS.IOS.CAMERA);
            if (cameraPermission === RESULTS.GRANTED) {
                hasCamera = true;
            } else if (cameraPermission === RESULTS.DENIED) {
                let cameraRequest = await request(PERMISSIONS.IOS.CAMERA);
                if (cameraRequest === RESULTS.GRANTED) {
                    hasCamera = true;
                }
            }
            let microphonePermission = await check(PERMISSIONS.IOS.MICROPHONE);
            if (microphonePermission === RESULTS.GRANTED) {
                hasMicrophone = true;
            } else if (microphonePermission === RESULTS.DENIED) {
                let microphoneRequest = await request(PERMISSIONS.IOS.MICROPHONE);
                if (microphoneRequest === RESULTS.GRANTED) {
                    hasMicrophone = true;
                }
            }
            if (!hasCamera || !hasMicrophone) {
                return;
            }
            // TODO: implement go to settings
        }
    };

    render() {
        const runFirst = 'window.isNativeApp = true;true;';

        return (
            this.state.isFaceDetectionActive ?
                <ScrollView>
                    <SafeAreaView style={{height: screenHeight}}>
                        <WebView
                            /**
                             * This HTML is a copy of a multi-frame JS injection test that I had lying around.
                             * @see https://birchlabs.co.uk/linguabrowse/infopages/obsol/iframeTest.html
                             */
                            // source={{ html: HTML }}
                            source={{uri: 'https://justadudewhohacks.github.io/face-api.js/webcam_face_tracking'}}
                            automaticallyAdjustContentInsets={false}
                            style={{backgroundColor: '#00000000'}}

                            /* Must be populated in order for `messagingEnabled` to be `true` to activate the
                             * JS injection user scripts, consistent with current behaviour. This is undesirable,
                             * so needs addressing in a follow-up PR. */
                            onMessage={() => {
                            }}

                            /* We set this property in each frame */
                            injectedJavaScriptBeforeContentLoaded={`
              console.log("executing injectedJavaScriptBeforeContentLoaded...");
              if(typeof window.top.injectedIframesBeforeContentLoaded === "undefined"){
                window.top.injectedIframesBeforeContentLoaded = [];
              }
              window.self.colourToUse = "transparent";
              if(window.self === window.top){
                console.log("Was window.top. window.frames.length is:", window.frames.length);
                window.self.numberOfFramesAtBeforeContentLoaded = window.frames.length;
                function declareSuccessOfBeforeContentLoaded(head){
                  var style = window.self.document.createElement('style');
                  style.type = 'text/css';
                  style.innerHTML = "#before_failed { display: none !important; }#before_succeeded { display: inline-block !important; }";
                  head.appendChild(style);
                }
                const head = (window.self.document.head || window.self.document.getElementsByTagName('head')[0]);
                if(head){
                  declareSuccessOfBeforeContentLoaded(head);
                } else {
                  window.self.document.addEventListener("DOMContentLoaded", function (event) {
                    const head = (window.self.document.head || window.self.document.getElementsByTagName('head')[0]);
                    declareSuccessOfBeforeContentLoaded(head);
                  });
                }
              } else {
                window.top.injectedIframesBeforeContentLoaded.push(window.self.name);
                console.log("wasn't window.top.");
                console.log("wasn't window.top. Still going...");
              }
              `}

                            injectedJavaScriptForMainFrameOnly={false}

                            /* We read the colourToUse property in each frame to recolour each frame */
                            injectedJavaScript={`
              console.log("executing injectedJavaScript...");
              if(typeof window.top.injectedIframesAfterContentLoaded === "undefined"){
                window.top.injectedIframesAfterContentLoaded = [];
              }
              if(window.self.colourToUse){
                window.self.document.body.style.backgroundColor = window.self.colourToUse;
              } else {
                window.self.document.body.style.backgroundColor = "cyan";
              }
              if(window.self === window.top){
                function declareSuccessOfAfterContentLoaded(head){
                  var style = window.self.document.createElement('style');
                  style.type = 'text/css';
                  style.innerHTML = "#after_failed { display: none !important; }#after_succeeded { display: inline-block !important; }";
                  head.appendChild(style);
                }
                declareSuccessOfAfterContentLoaded(window.self.document.head || window.self.document.getElementsByTagName('head')[0]);
                // var numberOfFramesAtBeforeContentLoadedEle = document.createElement('p');
                // numberOfFramesAtBeforeContentLoadedEle.textContent = "Number of iframes upon the main frame's beforeContentLoaded: " +
                // window.self.numberOfFramesAtBeforeContentLoaded;
                // var numberOfFramesAtAfterContentLoadedEle = document.createElement('p');
                // numberOfFramesAtAfterContentLoadedEle.textContent = "Number of iframes upon the main frame's afterContentLoaded: " + window.frames.length;
                // numberOfFramesAtAfterContentLoadedEle.id = "numberOfFramesAtAfterContentLoadedEle";
                var namedFramesAtBeforeContentLoadedEle = document.createElement('p');
                namedFramesAtBeforeContentLoadedEle.textContent = "Names of iframes that called beforeContentLoaded: " + JSON.stringify(window.top.injectedIframesBeforeContentLoaded);
                namedFramesAtBeforeContentLoadedEle.id = "namedFramesAtBeforeContentLoadedEle";
                var namedFramesAtAfterContentLoadedEle = document.createElement('p');
                namedFramesAtAfterContentLoadedEle.textContent = "Names of iframes that called afterContentLoaded: " + JSON.stringify(window.top.injectedIframesAfterContentLoaded);
                namedFramesAtAfterContentLoadedEle.id = "namedFramesAtAfterContentLoadedEle";
                // document.body.appendChild(numberOfFramesAtBeforeContentLoadedEle);
                // document.body.appendChild(numberOfFramesAtAfterContentLoadedEle);
                document.body.appendChild(namedFramesAtBeforeContentLoadedEle);
                document.body.appendChild(namedFramesAtAfterContentLoadedEle);
              } else {
                window.top.injectedIframesAfterContentLoaded.push(window.self.name);
                window.top.document.getElementById('namedFramesAtAfterContentLoadedEle').textContent = "Names of iframes that called afterContentLoaded: " + JSON.stringify(window.top.injectedIframesAfterContentLoaded);
              }
              `}/>
                    </SafeAreaView>
                </ScrollView>
                :
                <ScrollView>
                    <SafeAreaView style={styles.container}>
                        <TouchableOpacity
                            style={{
                                flex: 1,
                                backgroundColor: 'red',
                                borderColor: '#FFFFFF',
                                borderRadius: 70,
                            }}
                            onPress={() => {
                                this.startFaceDetection();
                            }}
                        >
                            <Text style={{color: 'white', margin: 20}}>Click to start face detection.</Text>
                        </TouchableOpacity>
                    </SafeAreaView>
                </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
    },

});

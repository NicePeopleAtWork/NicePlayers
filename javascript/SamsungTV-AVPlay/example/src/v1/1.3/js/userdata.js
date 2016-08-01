function checkYouboraData(){
    if(typeof youboraData === 'undefined'){
        setTimeout(checkYouboraData,100)
    }else{
        youboraData.setDebug(true);
    youboraData.setAccountCode('nicetv');
    youboraData.setUsername('kaltura-kdp');
    youboraData.setService('http://nqs.nice264.com');
    youboraData.setContentId('testsContetId');
    youboraData.setLive(false);
    youboraData.setProperties({
        filename: "File Name",
        content_id: "Content Id", 
        content_metadata: { 
            title: "Title", 
            genre: "Genre", 
            language: "Language", 
            year: "Year", 
            cast: "Cast", 
            director: "Director", 
            owner: "Owner", 
            duration: "Duration", 
            parental: "Parental", 
            price: "Price",
            rating: "Rating",
            audioType: "Audio type", 
            audioChannels: "Audio channels"
        },
        transaction_type: "Transaction Types", 
        quality: "Quality", 
        content_type: "Content Type", 
        device: { 
            manufacturer: "Manufacturer", 
            type: "Type", 
            year: "Year", 
            firmware: "Firmware" 
        }
    }); 
    youboraData.setResumeProperties({
                    resumeEnabled:   true,
                    resumeService:   "http://pc.youbora.com/resume/", 
                    playTimeService: "http://pc.youbora.com/playTime/",    
                    resumeCallback:  function(secs) { 
                        console.log('Resume Callback: ' + secs); 
                    }              
    });


    youboraData.setExtraParam(1, 'extraparam1');
    youboraData.setExtraParam(2, 'extraparam2');
    youboraData.setExtraParam(3, 'extraparam3');
    youboraData.setExtraParam(4, 'extraparam4');
    youboraData.setExtraParam(5, 'extraparam5');
    youboraData.setExtraParam(6, 'extraparam6');
    youboraData.setExtraParam(7, 'extraparam7');
    youboraData.setExtraParam(8, 'extraparam8');
    youboraData.setExtraParam(9, 'extraparam9');
    youboraData.setExtraParam(10, 'extraparam10');
    youboraData.setCDNNodeData(true);
    youboraData.setConcurrencyProperties({
        enabled: true,
        concurrencyService: "http://pc.youbora.com/cping/", 
        concurrencyCode: "testCode", 
        concurrencyMaxCount: 1,
        concurrencyRedirectUrl: function(secs) { 
            console.log('Max Concurrecy! Exit Now !!!'); 
        },
        concurrencyIpMode: false 
    });
    }
}
checkYouboraData()
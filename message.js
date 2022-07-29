async function RTMJoin(uid) {
    const appid = $("#appid").val();
    
    const clientRTM = AgoraRTM.createInstance(appid, {
        enableLogUpload: false
    });

    var accountName = $('#accountName').val();

    await clientRTM.login({
        uid: accountName, token: null
    }).then(() => {
        console.log('AgoraRTM client login success. Username: ' + accountName);
        isLoggedIn = true;
        var channelName = $('#channel').val();
        channel = clientRTM.createChannel(channelName);
        channel.join().then(() => {
            console.log('AgoraRTM client channel join success.');
            channel.getMembers().then((memberNames) => {
                console.log("------------------------------");
                console.log("All members in the channel are as follows: ");
                console.log(memberNames);
            });

            $(document).on('click', '.sendMessage', function () {
                const fullDivId = $(this).attr('id');
                const peerId = fullDivId.substring(fullDivId.indexOf("-") + 1);
                console.log("Remote microphone button pressed.");
                let peerMessage = $("#sendMessageText").val();

                var htmlText = `<li class="mt-2 message">
                <div class="row">
                    <p>${peerMessage}</p>
                 </div></li>
               `;
                document.getElementById('insert-all-users').innerHTML += htmlText;
                getTotalMembers().then((memberNames) => {
                    $.map(memberNames, function (singleMember) {
                        if (singleMember != accountName) {
                            clientRTM.sendMessageToPeer({
                                text: peerMessage
                            },
                                singleMember,
                            );
                        }
                    });
                })
            });

            clientRTM.on('MessageFromPeer', function ({
                text
            }, peerId) {

                if (text.includes("count")) {

                }
                else {

                    console.log(peerId + " muted/unmuted your " + text);
                    var htmlText = `<li class="mt-2">
                <div class="row">
                    <p>${peerId}</p>
                    <p>${text}</p>
                 </div></li>
               `;
                    document.getElementById('insert-all-users').innerHTML += htmlText;
                }

            })

            channel.on('MemberJoined', function () {
                channel.getMembers().then((memberNames) => {
                    console.log("New member joined so updated list is: ");
                    console.log(memberNames);
                    var newHTML = $.map(memberNames, function (singleMember) {
                       
                        if (singleMember != accountName) {
                            member = singleMember;
                            return (`<li class="mt-2">
                      <div class="row">
                          <p>${singleMember}</p>
                       </div>
                     </li>`);
                        }
                    });
                });
            })
            channel.on('MemberLeft', function () {
                channel.getMembers().then((memberNames) => {
                    console.log(memberNames);
                    let member = "";
                    var newHTML = $.map(memberNames, function (singleMember) {
                        if (singleMember != accountName) {
                            member = singleMember;
                            return (`<li class="mt-2">
                      <div class="row">
                          <p>${singleMember}</p>
                       </div>
                     </li>`);
                        }
                    });

                    document.getElementById('insert-all-users').innerHTML += htmlText;
                });
            });
        }).catch(error => {
            console.log('AgoraRTM client channel join failed: ', error);
        }).catch(err => {
            console.log('AgoraRTM client login failure: ', err);
        });
    });

    async function getTotalMembers() {
        return await channel.getMembers();
    }
    document.getElementById("leave").onclick = async function () {
        console.log("Client logged out of RTM.");
        document.getElementById('insert-all-users').remove();
        await clientRTM.logout();
    }
}
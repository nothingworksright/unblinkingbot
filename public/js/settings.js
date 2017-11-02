'use strict'

/**
 * Settings page scripts, ublinkingBot web based management console.
 * @author {@link https://github.com/jmg1138 jmg1138}
 * @see {@link http://unblinkingbot.com/ unblinkingBot.com}
 */

/* eslint-env jquery */
/* global io */

var socket = io.connect()

/**
 * Announcement of error, animation sequence.
 * First, fade to zero opacity and slide up out of view just in case it is
 * visible. Next, set html content, slide down, and fade to full opacity. Leave
 * the error announcement on the screen for the user to manually dismiss.
 * @param {JQuery} element The JQuery element selector to be manipulated.
 * @param {String} html HTML to set as the content of each matched element.
 */
async function announcementAnimationError (element, html) {
  try {
    await fade(element, 0, 0)
    await upSlide(element, 0)
    await htmlSet(element, html)
    await downSlide(element, 500)
    await fade(element, 500, 1)
    return
  } catch (err) {
    alert(err)
  }
}

/**
 * Announcement of success, animation sequence.
 * First, fade to zero opacity and slide up out of view just in case it is
 * visible. Next, set html content, slide down, fade to full opacity, and sleep
 * while the announcement is visible. Last, fade to zero opacity and slide up
 * out of view.
 * @param {JQuery} element The JQuery element selector to be manipulated.
 * @param {String} html HTML to set as the content of each matched element.
 */
async function announcementAnimationSuccess (element, html) {
  try {
    await fade(element, 0, 0)
    await upSlide(element, 0)
    await htmlSet(element, html)
    await downSlide(element, 500)
    await fade(element, 500, 1)
    await countTo(5)
    await fade(element, 500, 0)
    await upSlide(element, 500)
    return
  } catch (err) {
    alert(err)
  }
}

/**
 * Show the Slack RTM Disconnection announcement.
 * @param {String} message A message from the Slack RTM Disconnection event.
 */
async function announcementSlackDisconnection (message) {
  try {
    let element = $('#stopSlackIntegrationAlert')
    let html = `<div class="alert alert-warning mt-3"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><strong>Warning!</strong> Slack integration was stopped.<br><span class="small">Message: ${message}</span></div>`
    await announcementAnimationSuccess(element, html)
    return
  } catch (err) {
    console.log(err)
  }
}

/**
 * Count to a number of seconds and then continue.
 * @param {number} seconds How many seconds to count to.
 */
function countTo (seconds) {
  return new Promise(resolve => setTimeout(resolve, (seconds * 1000)))
}

/**
 * Animated slide-down to hide the matched elements.
 * @param {JQuery} element The JQuery element selector to be manipulated.
 * @param {Number} speed Duration of the animation in milliseconds.
 */
function downSlide (element, speed) {
  return new Promise(resolve => element.show(speed, resolve))
}

/**
 * Attach a handler to the click event for the restartSlack button element.
 * When clicked; Replace the button html with a loader animation and a
 * restarting message, and then emit a slackRestartReq event via Socket.io.
 */
function enableRestartSlackBtn () {
  return new Promise(resolve => {
    let btn = $('#startSlack')
    btn.off('click') // Start with no click handler, prevent duplicates.
    btn.html(`Restart Slack RTM Client`)
    btn.one('click', () => { // Add new click handler.
      btn.off('click') // When clicked, remove handler.
      btn.html(`<div class="loader float-left"></div> &nbsp; Restarting Slack RTM Client`)
      socket.emit('slackRestartReq')
    })
    resolve()
  })
}

/**
 * Attach a handler to the click event for the stopSlack button element.
 * When clicked; Replace the button html with a loader animation and a
 * stopping message, and then emit a slackStopReq event via Socket.io.
 */
function enableStopSlackBtn () {
  return new Promise(resolve => {
    let btn = $('#stopSlack')
    btn.off('click') // Remove previous handler to start with none.
    btn.html(`Stop Slack RTM Client`)
    btn.one('click', () => { // Add new handler.
      btn.off('click') // When clicked, remove handler.
      btn.html(`<div class="loader float-left"></div> &nbsp; Stopping Slack RTM Client`)
      socket.emit('slackStopReq')
    })
    resolve()
  })
}

/**
 * Attach a handler to the click event for the saveToken button element.
 * When clicked; Replace the button html with a loader animation, and then emit
 * a saveSlackTokenReq event via Socket.io containing the value from the
 * slackToken input element.
 */
function enableSaveTokenBtn () {
  return new Promise(resolve => {
    let btn = $('#saveToken')
    btn.off('click') // Remove previous handler to start with none.
    btn.html(`Save`)
    btn.one('click', () => { // Add new handler.
      btn.off('click') // When clicked, remove handler.
      btn.html(`<div class="loader float-left"></div>`)
      socket.emit('saveSlackTokenReq', $('input[id=slackToken]').val())
    })
    resolve()
  })
}

/**
 *
 */
function enableSaveNotifyBtn () {
  return new Promise(resolve => {
    let btnC = $('#saveSlackDefaultNotifyChannel')
    let btnG = $('#saveSlackDefaultNotifyGroup')
    let btnU = $('#saveSlackDefaultNotifyUser')
    btnC.off('click') // Remove previous handler to start with none.
    btnG.off('click') // Remove previous handler to start with none.
    btnU.off('click') // Remove previous handler to start with none.
    btnC.html(`Save`)
    btnG.html(`Save`)
    btnU.html(`Save`)
    btnC.one('click', () => { // Add new handler.
      btnC.off('click') // When clicked, remove handler.
      btnC.html(`<div class="loader float-left"></div>`)
      socket.emit(
        'saveSlackNotifyReq',
        $('select[id=defaultChannelSelect]').val(),
        'channel'
      )
    })
    btnG.one('click', () => { // Add new handler.
      btnG.off('click') // When clicked, remove handler.
      btnG.html(`<div class="loader float-left"></div>`)
      socket.emit(
        'saveSlackNotifyReq',
        $('select[id=defaultGroupSelect]').val(),
        'group'
      )
    })
    btnU.one('click', () => { // Add new handler.
      btnU.off('click') // When clicked, remove handler.
      btnU.html(`<div class="loader float-left"></div>`)
      socket.emit(
        'saveSlackNotifyReq',
        $('select[id=defaultUserSelect]').val(),
        'user'
      )
    })
    resolve()
  })
}

/**
 * Remove the has-success class from inputs on focus events.
 */
function removeSuccessOnFocus () {
  return new Promise(resolve => {
    $('#slackToken').focus(() => $('#slackTokenInputGroup').removeClass('has-success'))
    $('#defaultChannelSelect').focus(() => $('#inputChannels').removeClass('has-success'))
    $('#defaultGroupSelect').focus(() => $('#inputGroups').removeClass('has-success'))
    $('#defaultUserSelect').focus(() => $('#inputUsers').removeClass('has-success'))
    resolve()
  })
}

/**
 *
 */
function enableNotifyTypeRadioBtn () {
  return new Promise(resolve => {
    $('#radioChannel').off('click') // Remove previous handler to start with none.
    $('#radioChannel').one('click', () => { // Add new handler.
      $('#radioChannel').off('click') // When clicked, remove handler.
      hideDefaultNotifySelectors() // Start with all options hidden and an empty select element.
      $('#defaultChannelSelect')[0].options.length = 0
      $('#progressDefaultNotifications').removeClass('hidden-xs-up') // Show progress bar.
      socket.emit('channelsReq')
    })
    $('#radioGroup').off('click') // Remove previous handler to start with none.
    $('#radioGroup').one('click', () => { // Add new handler.
      $('#radioGroup').off('click') // When clicked, remove handler.
      hideDefaultNotifySelectors() // Start with all options hidden and an empty select element.
      $('#defaultGroupSelect')[0].options.length = 0
      $('#progressDefaultNotifications').removeClass('hidden-xs-up') // Show progress bar.
      socket.emit('readSlackGroupsReq')
    })
    $('#radioUser').off('click') // Remove previous handler to start with none.
    $('#radioUser').one('click', () => { // Add new handler.
      $('#radioUser').off('click') // When clicked, remove handler.
      hideDefaultNotifySelectors() // Start with all options hidden and an empty select element.
      $('#defaultUserSelect')[0].options.length = 0
      $('#progressDefaultNotifications').removeClass('hidden-xs-up') // Show progress bar.
      socket.emit('readSlackUsersReq')
    })
    resolve()
  })
}

function enableSaveMotionUrlBtn () {
  return new Promise(resolve => {
    let btn = $('#saveMotionUrl')
    btn.off('click') // Remove previous handler to start with none.
    btn.html(`Save`)
    btn.one('click', () => { // Add new handler.
      btn.off('click') // When clicked, remove handler.
      btn.html(`<div class="loader float-left"></div>`)
      socket.emit('saveMotionUrlReq', {
        'name': $('input[id=motionNickname]').val(),
        'url': $('input[id=motionSnapshotUrl]').val()
      })
    })
    resolve()
  })
}

/**
 * Animated change in opacity of the matched elements.
 * @param {JQuery} element The JQuery element selector to be manipulated.
 * @param {Number} speed Duration of the animation in milliseconds.
 * @param {Number} opacity Target opacity, a number between 0 and 1.
 */
function fade (element, speed, opacity) {
  return new Promise(resolve => element.fadeTo(speed, opacity, resolve))
}










function handleSaveMotionUrlSuccess (object) {
  return new Promise(resolve => {
    $('#motionSnapshotUrlList').append("<a href='" + object.url + "'>" + object.name + '</a><br>')
    $('#motionUrlInputGroup').addClass('has-success')
    resolve()
  })
}

/**
 * Hide all drop down selectors for default notifications
 */
function hideDefaultNotifySelectors () {
  return new Promise(resolve => {
    $('#inputChannels').addClass('hidden-xs-up')
    $('#inputGroups').addClass('hidden-xs-up')
    $('#inputUsers').addClass('hidden-xs-up')
    resolve()
  })
}

/**
 * Set the HTML contents of matched elements.
 * @param {JQuery} element The JQuery element selector to be manipulated.
 * @param {String} html HTML string to set as the content of matched elements.
 */
function htmlSet (element, html) {
  return new Promise(resolve => {
    element.html(html)
    resolve()
  })
}

function populateDropDown (element, array, selector) {
  return new Promise(resolve => {
    element.removeClass('hidden-xs-up')
    for (let i = 0; i < array.length; i++) {
      let name = array[i]
      let option = document.createElement('option')
      option.text = name
      selector[0].add(option)
    }
    $('#progressDefaultNotifications').addClass('hidden-xs-up') // Hide progress bar.
    resolve()
  })
}

/**
 *
 */
function motionSnapshotsReq () {
  return new Promise(resolve => {
    socket.emit('motionSnapshotsReq')
    resolve()
  })
}

/**
 * Animated slide-up to hide the matched elements.
 * @param {JQuery} element The JQuery element selector to be manipulated.
 * @param {Number} speed Duration of the animation in milliseconds.
 */
function upSlide (element, speed) {
  return new Promise(resolve => {
    element.hide(speed, resolve)
    resolve()
  })
}

/**
 *
 */
function slackConnectionStatusReq () {
  return new Promise(resolve => {
    socket.emit('slackConnectionStatusReq')
    resolve()
  })
}

/**
 *
 */
function slackTokenReq () {
  return new Promise(resolve => {
    socket.emit('slackTokenReq')
    resolve()
  })
}

/**
 *
 */
function slackNotifyReq () {
  return new Promise(resolve => {
    socket.emit('slackNotifyReq')
    resolve()
  })
}

/**
 * Update the Slack connection status.
 * @param {Boolean} connected True if connected, false if disconnected.
 */
function slackConnectionStatusUpdate (connected) {
  return new Promise(resolve => {
    let element = $('#slackIntegrationStatus')
    if (connected) {
      element.removeClass('text-danger')
      element.html('connected')
      element.addClass('text-success')
    } else if (!connected) {
      element.removeClass('text-success')
      element.html('disconnected')
      element.addClass('text-danger')
    }
    resolve()
  })
}

/**
 *
 */
socket.on('channelsRes', channelNames =>
  enableNotifyTypeRadioBtn()
    .then(() => populateDropDown($('#inputChannels'), channelNames,
      $('#defaultChannelSelect'))))

socket.on('motionSnapshotsRes', text => {
  $('#motionSnapshotUrlList').append(text + '<br>')
})

/**
 *
 */
socket.on('readSlackGroupsRes', groupNames =>
  enableNotifyTypeRadioBtn()
    .then(() => populateDropDown($('#inputGroups'), groupNames,
      $('#defaultGroupSelect'))))

/**
 *
 */
socket.on('readSlackUsersRes', userNames =>
  enableNotifyTypeRadioBtn()
    .then(() => populateDropDown($('#inputUsers'), userNames,
      $('#defaultUserSelect'))))

/**
 * Register the "saveSlackNotifyRes" event handler.
 * Enable the save button, update notify on-screen, and display an announcement.
 */
socket.on('saveSlackNotifyRes', (notify, notifyType, success, err) =>
  handleSaveSlackNotifyRes(notify, notifyType, success, err)
)

async function handleSaveSlackNotifyRes (notify, notifyType, success, err) {
  try {
    await enableSaveNotifyBtn()
    if (success) {
      $('#currentSettingsNotify').html(`${notifyType} ${notify}`)
      if (notifyType === 'channel') $('#inputChannels').addClass('has-success')
      if (notifyType === 'group') $('#inputGroups').addClass('has-success')
      if (notifyType === 'user') $('#inputUsers').addClass('has-success')
      let element = $('#saveSlackNotifyAlert')
      let html = `<div class="alert alert-success"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><strong>Success!</strong> Default notification recipient saved successfully.</div>`
      await announcementAnimationSuccess(element, html)
    } else {
      $('#inputChannels').addClass('has-error')
      $('#inputGroups').addClass('has-error')
      $('#inputUsers').addClass('has-error')
      let element = $('#saveSlackNotifyAlert')
      let html = `<div class="alert alert-danger"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><strong>Error!</strong> There was an error. Default notification recipient was not saved. &nbsp; <span class="badge badge-warning small"><a data-toggle="collapse" data-target="#errorDetails" aria-expanded="false" aria-controls="errorDetails">Details</a></span><br><br><div class="container-fluid rounded p-3 collapse" id="errorDetails" style="background-color:#000; overflow:hidden"> ${err} </div></div>`
      await announcementAnimationError(element, html)
    }
  } catch (err) {
    alert(err)
  }
}

socket.on('saveSlackTokenRes', (token, success, err) =>
  handleSaveSlackTokenRes(token, success, err)
)

async function handleSaveSlackTokenRes (token, success, err) {
  try {
    await enableSaveTokenBtn()
    if (success) {
      $('#slackTokenInputGroup').addClass('has-success')
      socket.emit('slackRestartReq')
      let element = $('#saveSlackTokenAlert')
      let html = `<div class="alert alert-success"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><strong>Success!</strong> Slack token saved successfully. Slack integration is being restarted to use the new token.</div>`
      await announcementAnimationSuccess(element, html)
    } else {
      $('#slackTokenInputGroup').addClass('has-error')
      let element = $('#saveSlackTokenAlert')
      let html = `<div class="alert alert-danger"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><strong>Error!</strong> There was an error. Slack token was not saved.<br><span class="small">Message: ${err}</span></div>`
      await announcementAnimationError(element, html)
    }
    return
  } catch (err) {
    alert(err)
  }
}


socket.on('slackConnectionStatusRes', connected =>
  slackConnectionStatusUpdate(connected)
)

/**
 * Register the "slackConnectionOpened" event handler.
 * Enable the restart button, update connection status, and display an announcement.
 */
socket.on('slackConnectionOpened', async (message) =>
  enableRestartSlackBtn()
    .then(() => slackConnectionStatusUpdate(true))
    .then(() => announcementSlackConnection(message)))

/**
 * Show the Slack RTM Connection announcement.
 * @param {String} message A message from the Slack RTM Connection event.
 */
async function announcementSlackConnection (message) {
  try {
    let element = $('#restartSlackIntegrationAlert')
    let html = `<div class="alert alert-info mt-3"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><strong>Heads-up!</strong> Slack integration was started.<br><span class="small">Message: ${message}</span></div>`
    await announcementAnimationSuccess(element, html)
    return
  } catch (err) {
    console.log(err)
  }
}

socket.on('slackConnectionFailed', async (message) => {
  await enableRestartSlackBtn()
  await slackConnectionStatusUpdate(false)
  await announcementAnimationError(
    $('#restartSlackIntegrationAlert'),
    `<div class="alert alert-danger mt-3"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><strong>Error!</strong> Slack integration was not started.<br><span class="small">Message: ${message}</span></div>`
  )
})


/**
 * Register the "slackDisconnection" event handler.
 * Enable the stop button, update connection status, and display an announcement.
 */
socket.on('slackDisconnection', message => handleSlackDisconnection(message))

async function handleSlackDisconnection (message) {
  await enableStopSlackBtn()
  await slackConnectionStatusUpdate(false)
  await announcementSlackDisconnection(message)
}

/**
   *
   */
socket.on('slackNotifyRes', data =>
  $('#currentSettingsNotify').html(data.notifyType + ' ' + data.notify))

/**
   *
   */
socket.on('slackTokenRes', token => {
  $('#slackToken').val(token)
})

/**
 * TODO: render and show announcement too
 */
socket.on('saveMotionUrlRes', (object, success, err) => {
  enableSaveMotionUrlBtn()
    .then(() => {
      if (success) handleSaveMotionUrlSuccess(object)
      if (!success) handleSaveMotionUrlError(err)
    })
})

/**
 * Initialize all tooltips
 * https://v4-alpha.getbootstrap.com/components/tooltips/
 */
$(() => $('[data-toggle="tooltip"]').tooltip())


/**
 * Setup the page buttons when this script is loaded.
 */
enableRestartSlackBtn()
  .then(enableStopSlackBtn())
  .then(enableSaveTokenBtn())
  .then(enableSaveNotifyBtn())
  .then(removeSuccessOnFocus())
  .then(enableNotifyTypeRadioBtn())
  .then(enableSaveMotionUrlBtn())

/**
 * Request the current Slack details.
 */
slackConnectionStatusReq()
  .then(slackTokenReq())
  .then(slackNotifyReq())

/**
 * Request the current motionEye details.
 */
motionSnapshotsReq()
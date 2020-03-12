const container = document.getElementById('displayContainer')
const optionsHeader = document.getElementById('optionsHeader')
const divOptions = document.getElementById('options')
const rngDotSize = document.getElementById('rngDotSize')
const rngColumns = document.getElementById('rngColumns')
const rngSpeed = document.getElementById('rngSpeed')
const inputDotColor = document.getElementById('inputDotColor')
var optionsToggle = 0
var noOfColumns = 40
var scrollTimer
var scrollSpeed = 52
var scrollActive = 0
var inputMessage
var displayInput
var columns
var dots
var cssDotSize
var cssDotColor

createDisplay(noOfColumns)
screenRefresh()

dots.forEach(function(dot){
    dot.addEventListener('click',(e)=>{
        if (!e.target.classList.contains('on')) {
            e.target.classList.add('on')
        } else {
            e.target.classList.remove('on')
        }
    })
})

optionsHeader.addEventListener('click', (e)=>{
    if (!optionsToggle) {
        divOptions.style.height = 'auto'
        optionsToggle = 1
    } else if (optionsToggle) {
        divOptions.style.height = '2.1em'
        optionsToggle = 0
    }
})

rngDotSize.addEventListener('input', ()=>{
    cssDotSize = `.dot { width: ${rngDotSize.value}px; height: ${rngDotSize.value}px; }`
    compileHeadCss()
    updateContainerSize()
    document.getElementById('rngDotSizeDisplay').textContent = rngDotSize.value
})

rngColumns.addEventListener('input', ()=>{
    let difference = 0

    if (rngColumns.value > noOfColumns) {
        difference = rngColumns.value - noOfColumns
        for (let i = 0; i < difference; i++) {
            noOfColumns++
            updateContainerSize()
            addColumn()
        }
    } else if (rngColumns.value < noOfColumns) {
        let lastChildIndex
        difference = noOfColumns - rngColumns.value
        for (let i = 0; i < difference; i++) {
            lastChildIndex = container.childNodes.length - 1
            container.removeChild(container.childNodes[lastChildIndex])
            noOfColumns--
            updateContainerSize()
        }
    }
    document.getElementById('rngColumnsDisplay').textContent = rngColumns.value
    screenRefresh()
})

rngSpeed.addEventListener('input', ()=>{
    document.getElementById('rngSpeedDisplay').textContent = rngSpeed.value
    scrollSpeed = (-8 * rngSpeed.value) + 100
    if (scrollActive) {
        screenRefresh()
        messageScroll(displayInput)
    }
})

inputDotColor.addEventListener('change', ()=>{
    cssDotColor = `.dot.on { background-color: ${inputDotColor.value}; }`
    compileHeadCss()
})

document.getElementById('btnFullScreen').addEventListener('click', (e)=>{
    if (container.requestFullscreen) {
        container.requestFullscreen()
    } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen()
    }
})

container.addEventListener('fullscreenchange', containerFullScreenChange);
container.addEventListener('webkitfullscreenchange', containerFullScreenChange);
container.addEventListener('mozfullscreenchange', containerFullScreenChange);
container.addEventListener('msfullscreenchange', containerFullScreenChange);

fetch('./letters.json')
    .then((data)=>{
        return data.json()
    })
    .then((displayAlphabet)=>{
        document.getElementById('btnScroll').addEventListener('click', (e)=>{
            e.preventDefault()
            screenRefresh()
            inputMessage = document.getElementById('message').value
            displayInput = encodeMessage(displayAlphabet, inputMessage)
            messageScroll(displayInput)
        })

        document.getElementById('btnDisplay').addEventListener('click', ()=>{
            screenRefresh()
            inputMessage = document.getElementById('message').value
            displayInput = encodeMessage(displayAlphabet, inputMessage)
            messageDisplay(displayInput)
        })
    })

function createDisplay(columns) {
    container.innerHTML = ''
    for (let i = 0; i < columns; i++) {
        addColumn()
    }
}

function addColumn() {
    let column = document.createElement('div')
    let dot
    column.classList.add('col')
    for (let i=0; i<9; i++) {
        dot = document.createElement('div')
        dot.classList.add('dot')
        column.appendChild(dot)
    }
    container.appendChild(column)
}

function updateContainerSize() {
    container.style.width = rngDotSize.value * noOfColumns + 'px'
}

function compileHeadCss() {
    let headCss = ''
    if (cssDotSize) {
        headCss += cssDotSize
    }
    if (cssDotColor) {
         headCss += cssDotColor
    }
    document.querySelector('style').innerHTML = headCss
}

function messageDisplay(displayInput) {
    var staticMessage

    if (displayInput.length > noOfColumns) {
        staticMessage = displayInput.slice(0, noOfColumns)
    } else {
        staticMessage = displayInput
    }

    for (let i = 0; i < staticMessage.length; i++) {
        columns[columns.length - (i+1)].childNodes.forEach((dot, vertPosition) =>{
            if (staticMessage[i][vertPosition] === 1) {
                dot.classList.add('on')
            }
        })
    }
}

function messageScroll(displayInput) {
    let messagePosition = 0
    scrollActive = 1

    scrollTimer = setInterval(()=>{
        columns.forEach((column, index)=>{
            if (messagePosition - index < displayInput.length) {
                column.childNodes.forEach((dot, vertPosition) => {
                    if (displayInput[Math.max(messagePosition - index, 0)][vertPosition] === 1 && !dot.classList.contains('on')) {
                        dot.classList.add('on')
                    } else if (displayInput[Math.max(messagePosition - index, 0)][vertPosition] === 0 && dot.classList.contains('on')) {
                        dot.classList.remove('on')
                    }
                })
            }
        })
        if (messagePosition < (displayInput.length + noOfColumns)) {
            messagePosition++
        } else {
            messagePosition = 0
        }
    }, scrollSpeed)
}

function encodeMessage(displayAlphabet, message) {
    let displayInput = [[0,0,0,0,0,0,0,0,0]]
    for (let i=0; i < message.length; i++) {
        let character = message.substr(i, 1)
        if (displayAlphabet.hasOwnProperty(character)) {
            displayInput = displayInput.concat(displayAlphabet[character])
            displayInput.push([0, 0, 0, 0, 0, 0, 0, 0, 0])
        }
    }
    return displayInput
}

function screenRefresh() {
    clearInterval(scrollTimer)
    scrollActive = 0

    columns = document.querySelectorAll('.col')
    dots = document.querySelectorAll('.dot')

    dots.forEach((dot)=>{
        if (dot.classList.contains('on')) {
            dot.classList.remove('on')
        }
    })
}

function containerFullScreenChange() {
    clearInterval(scrollTimer)

    if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
        let fsDotSize = window.screen.height / 12
        noOfColumns = Math.floor(window.screen.width / fsDotSize)
        cssDotSize = `.dot { width: ${fsDotSize}px; height: ${fsDotSize}px; }`
    } else {
        noOfColumns = (rngColumns.value / 1)
        cssDotSize = `.dot { width: ${rngDotSize.value}px; height: ${rngDotSize.value}px; }`
    }

    createDisplay(noOfColumns)
    compileHeadCss()
    if (scrollActive) {
        screenRefresh()
        messageScroll(displayInput)
    }
}

// document.getElementById('btnCapture').addEventListener('click', displayCapture)
//
// function displayCapture() {
//     let output = []
//     for (let i=0; i < noOfColumns; i++) {
//         let column = document.getElementById(`column${i}`)
//         output.push([])
//         column.childNodes.forEach((dot, index)=>{
//             if (dot.classList.contains('on')) {
//                 output[i].push(1)
//             } else {
//                 output[i].push(0)
//             }
//         })
//     }
//     document.getElementById('arrayDump').textContent = JSON.stringify(output.reverse())
// }
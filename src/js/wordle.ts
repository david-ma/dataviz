import { d3 } from 'chart'

console.log('hello wordle')

var words = []
var bannedLetters = ''.split('')
var knownLetters = []
var imperfectLetters = ['', '', '', '', '']
var perfectLetters = ['', '', '', '', '']
var submittedWords: string[] = []

document
  .getElementById('wordForm')
  .addEventListener('submit', function (event) {
    event.preventDefault()
  })

function submitWord() {
  var word = document.getElementById('word') as HTMLInputElement
  var wordValue = word.value.trim().toLowerCase()
  word.value = ''

  // if (words.indexOf(wordValue) !== -1) {
  if (wordValue.match(/^\w{5}$/)) {
    console.log('valid word', wordValue)
    addWord(wordValue)
  } else {
    alert('Invalid Word')
  }
}

function resetWords() {
  bannedLetters = ''.split('')
  knownLetters = []
  imperfectLetters = ['', '', '', '', '']
  perfectLetters = ['', '', '', '', '']
  submittedWords = []

  d3.select('#attempts table tbody').selectAll('tr').remove()
  d3.text('/words2.txt').then(function (data) {
    words = data.split('\n').map((word) => word.toLowerCase())
    d3.select('#attempts table tbody')
      .selectAll('tr')
      .data(['', '', '', '', '', ''])
      .enter()
      .append('tr')
      .selectAll('td')
      .data(['', '', '', '', ''])
      .enter()
      .append('td')
    calculateBestWords()
  })
}

function addWord(word: string) {
  console.log('Adding word', word)
  submittedWords.push(word)

  bannedLetters = bannedLetters.concat(word.split(''))

  d3.select('#attempts table tbody')
    .selectAll('tr')
    .data(submittedWords)
    .each((word, index, stuff) => {
      d3.select(stuff[index])
        .selectAll('td')
        .data(word.split(''))
        .text((letter) => letter)
        .attr('data-position', (letter, index) => index)
        .attr('data-status', function (val, index, stuff) {
          console.log('ok???', val)
          if (perfectLetters[index] === val) {
            bannedLetters = bannedLetters.filter((letter) => letter !== val)
            return 2
          } else if (imperfectLetters[index].indexOf(val) !== -1) {
            bannedLetters = bannedLetters.filter((letter) => letter !== val)
            return 1
          } else {
            return 0
          }
        })
        .on('click', function (event, val) {
          var that = d3.select(this)
          var index = that.attr('data-position')
          var status: number = (parseInt(that.attr('data-status')) + 1) % 3
          that.attr('data-status', status)
          if (status === 0) {
            imperfectLetters[index] = imperfectLetters[index].replace(val, '')
            perfectLetters[index] = perfectLetters[index].replace(val, '')
            bannedLetters.push(val)
          } else if (status === 1) {
            bannedLetters = bannedLetters.filter((letter) => letter !== val)
            perfectLetters[index] = perfectLetters[index].replace(val, '')
            imperfectLetters[index] += val
          } else if (status == 2) {
            imperfectLetters[index] = imperfectLetters[index].replace(val, '')
            bannedLetters = bannedLetters.filter((letter) => letter !== val)
            perfectLetters[index] = val
          }

          calculateBestWords()
        })
    })

  calculateBestWords()
}

function calculateBestWords() {
  d3.text('/words.txt').then(function (data) {
    words = data.split('\n').map((word) => word.toLowerCase())
    var index = indexWords(words)

    console.log('words', words)

    // bannedLetters = ''.split('')
    knownLetters = imperfectLetters.join('').split('').filter(onlyUnique)

    words = words.filter(removeWordsWithBannedLetters)

    words = words.filter(removeWordsWithoutKnownLetters)

    words = words.filter(removeWordsWithImperfectLetters)

    words = words.filter(onlyWordsWithPerfectLetters)

    console.log(index)
    console.log(words)

    var scoredWords: [string, number] = scoreWords(words, index).sort(function (
      a,
      b
    ) {
      return b[1] - a[1]
    })

    d3.select('#bestWords').selectAll('li').remove()

    console.log('scoredWords', scoredWords)
    d3.select('#bestWords')
      .selectAll('li')
      .data(
        scoredWords
          .slice(0, 50)
          .map((array) => array[0])
          .filter(onlyUnique)
        // .slice(0, 10)
      )
      .enter()
      .append('li')
      .append('a')
      .attr('href', '#')
      .on('click', function (event, data) {
        addWord(data)
      })
      .text((d) => d)
  })
}

calculateBestWords()

// Score words
function scoreWords(words, index) {
  return words.map(function (word) {
    return [
      word,
      word
        .split('')
        .filter(onlyUnique)
        .map(function (letter) {
          return index[letter] || 0
        })
        .reduce(function (a, b) {
          return a + b
        }),
    ]
  })
}

// Create index from words
// weigh each letter by its frequency
function indexWords(words: string[]) {
  var index = {}
  words.forEach(function (word) {
    // if(word.length !== 5) {
    //   console.log(word)
    // }
    word.split('').forEach(function (letter) {
      index[letter] = index[letter] || 0
      index[letter] += 1
    })
  })
  return index
}

// https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates
// TODO: lowercase/uppercase
function onlyUnique(value, index, self) {
  return self.indexOf(value) === index
}

// Remove words with banned letters
function removeWordsWithBannedLetters(word, index, self) {
  return !word.split('').some(function (letter) {
    return bannedLetters.indexOf(letter) !== -1
  })
}

function removeWordsWithoutKnownLetters(word, index, self) {
  var validWord = true

  knownLetters.forEach(function (letter) {
    if (word.split('').indexOf(letter) === -1) {
      validWord = false
    }
  })
  return validWord
}

function removeWordsWithImperfectLetters(word, index, self) {
  var validWord = true
  var letters = word.split('')

  letters.forEach(function (letter, index) {
    var wrongLetters = imperfectLetters[index].split('')
    if (wrongLetters.indexOf(letter) !== -1) {
      validWord = false
    }
  })
  return validWord
}

function onlyWordsWithPerfectLetters(word, index, self) {
  var validWord = true
  var letters = word.split('')

  letters.forEach(function (letter, index) {
    if (perfectLetters[index] && perfectLetters[index] !== letter) {
      validWord = false
    }
  })
  return validWord
}

d3.select('#other tbody')
  .selectAll('tr')
  .each((word, index, stuff) => {
    var tds = d3
      .select(stuff[index])
      .selectAll('td')
      .each((letter, index, stuff) => {
        var td = d3.select(stuff[index])
        td.attr('data-status', 0).on('click', function (event, data) {
          var that = d3.select(this)
          var status: number = (parseInt(that.attr('data-status')) + 1) % 3
          that.attr('data-status', status)
        })
      })
  })

function solution(length = 5, otherWord = '') {
  length = parseInt(<string>$('#otherLength').val()) || 4
  otherWord = <string>$('#otherWord').val() || 'solar'

  d3.select(`#other tbody tr:nth-child(${length})`)
    .selectAll('td')
    .data(otherWord.split(''))
    .each((letter, index, stuff) => {
      var td = d3.select(stuff[index])
      td.text(letter)
      td.attr('data-status', 2)
    })
}

function reverseSolve() {}

globalThis.submitWord = submitWord
globalThis.resetWords = resetWords

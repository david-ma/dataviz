console.log('hello wordle')

var words = []
var bannedLetters = []
var knownLetters = []
var imperfectLetters = ['', '', '', '', '']
var perfectLetters = ['', '', '', '', '']

document
  .getElementById('wordForm')
  .addEventListener('submit', function (event) {
    event.preventDefault()
  })

function submitWord() {
  var word = document.getElementById('word') as HTMLInputElement
  var wordValue = word.value.trim()
  word.value = ''

  if (words.indexOf(wordValue) !== -1) {
    console.log('valid word')
    addWord(wordValue)
  } else {
    alert('Invalid Word')
  }
}


var submittedWords: string[] = []
function addWord(word: string) {
  console.log('Adding word', word)
  submittedWords.push(word)

  d3.select('table tbody')
    .selectAll('tr')
    .data(submittedWords)
    .each((word, index, stuff) => {
      d3.select(stuff[index])
        .selectAll('td')
        .data(word.split(''))
        .text((letter) => letter)
    })
    .enter()
    .append('tr')
    .text((d) => d)
}

d3.text('/words.txt').then(function (data) {
  words = data.split('\n')
  var index = indexWords(words)

  bannedLetters = ''.split('')
  knownLetters = imperfectLetters.join('').split('').filter(onlyUnique)

  words = words.filter(removeWordsWithBannedLetters)

  words = words.filter(removeWordsWithoutKnownLetters)

  words = words.filter(removeWordsWithImperfectLetters)

  words = words.filter(onlyWordsWithPerfectLetters)

  console.log(index)

  var scoredWords = scoreWords(words, index).sort(function (a, b) {
    return b[1] - a[1]
  })

  console.log(scoredWords)
  d3.select('#bestWords')
    .selectAll('li')
    .data(scoredWords.slice(0, 10))
    .enter()
    .append('li')
    .text((d) => d[0])
})

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

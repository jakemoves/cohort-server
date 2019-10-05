// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

const CHEvent = require('./CHEvent')

process.env.NODE_ENV = 'test'

describe('CHEvent', () => {
  test('it inits', () => {
    expect(1).toEqual(1)
  })
})
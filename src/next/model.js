import {assignable, extensible, observable} from './decorators/internal'
import {STATE, TABLE, STATE_NEW} from './constants'

@assignable
@observable
@extensible
export default class Model extends Map {

  constructor(clientOrSession) {
    this[STATE] = STATE_NEW
    this._clientOrSession = clientOrSession

    this._query           = []
    this._changes         = []
    this._withRelated     = []
    this._loadedRelations = new Map() 
  }

  get __table__() {
    return this[TABLE]
  }

  // ----

  // Set "related" options for the current query chain.
  withRelated(...related) {
    this._withRelated = this._withRelated.concat(related)
    return this
  }

  fetch(options) {
    return this._clientOrSession.fetch(this, options)
  }

  fetchOne(options) {
    return this._clientOrSession.fetchOne(this, options)
  }

  fetchMany(options) {
    return this._clientOrSession.fetchMany(this, options)
  }

  save(options) {
    return this._clientOrSession.save(this, options)
  }

  destroy(options) {
    return this._clientOrSession.destroy(this, options)
  }

  /**
   * Load additional relations on the current model.
   *
   * @see {Client#load}
   * 
   * @param {array} relations relations to load on the current Model
   * @param  {[object]} options any options to pass along to the load call
   * @return {Promise<this|Error>} Promise resolving to the current model, or an error
   */
  load(relations, options) {
    return this._client.load(this, relations, options)
  }

  // Lifecycle Related

  // @return Iterator
  diff() {
    return this._entity.diff()
  }

  toJSON() {
    return this.serialize()
  }

  serialize() {
    return {...this.serializeModel(), ...this.serializeRelations()}
  }

  serializeModel() {
    var attrs = {}
    this._entity.forEach((v, k) => attrs[k] = v)
    return attrs
  }

  serializeRelations() {
    this._loadedRelations.forEach((v, k) => attrs[k] = v)
  }

}

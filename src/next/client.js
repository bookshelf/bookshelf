/**
 * @class Client
 * The Client is the keeper of a Map of Model constructors,
 * specifically decorated depending on the current client.
 *
 * This allows for a central source of metadata about the
 * model layer, as well as a convenient
 */
export default class Client {

  /**
   * @constructor
   * @param  {connection} connection   typically a knex instance
   * @param  {parentClient} [parentClient] optional, the parent client of this client object
   */
  constructor(connection, parentClient) {
    super()
    this.connection   = connection
    this.parentClient = parentClient
  }

  /**
   * Make a transaction for the current client, passing a newly reified Bookshelf
   * instance along, complete with a transaction.
   * 
   * @param {factory} Main "Bookshelf" factory
   * @param {container}
   * @return {Promise} a promise for either a fulfilled or rolled-back client
   */
  makeTransaction(factory, container) {
    return this.connection.transaction((trx) => {
      var bookshelf = factory(new this.constructor(trx, this))
      bookshelf.commit   = trx.commit
      bookshelf.rollback = trx.rollback
      return container(bookshelf)
    })
  }

  /**
   * Make a new "Session" object, proxied from the current client object
   * @param  {[type]} container [description]
   * @return {[type]}           [description]
   */
  makeSession(factory, container) {
    return container(new Session(this))
  }

  /**
   * Get a model based on the "modelRef"
   * @param  {[type]} modelRef [description]
   * @return {[type]}          [description]
   */
  get(modelRef) {
    if (getModel(modelRef)) {

    }
  }

  fetch(model, options) {
    
  }

  fetchOne(model, options) {

  }

  fetchMany(model, options) {

  }

  save(model, options) {

  }

  destroy(model, options) {

  }

  load() {

  }

  /**
   * Load a new session, a container for all of the data loaded/potential 
   * changes taking place within a set boundary.
   * @return {[type]} [description]
   */
  session() {

  }

  static makeClient(config) {
    if (isClient(config)) {
      return new Client(config)
    }
  }

}
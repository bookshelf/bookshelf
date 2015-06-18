import Model        from './model'
import Client       from './client'
import Session      from './session'
import {makeClient} from './client'

export default function Bookshelf(config) {

  const client = makeClient(config)

  /**
   * bookshelf object, the main point through which all
   * relations & data flows in the app
   * 
   * @param  {Object|string} modelRef reference to the model instance we wish to create
   * @return {model}         Model instance
   */
  function bookshelf(modelRef) {
    return client.makeModel(client.getModel(modelRef))
  }

  /**
   * Creates a transaction aware bookshelf object, with a 
   * commit and rollback interface.
   * @param {function} container Transaction "container", a function passed the transacting bookshelf instance
   * @return {Promise<mixed|Error>} Promise fulfilling with the result of the transaction
   */
  bookshelf.transaction = function transaction(container) {
    return client.makeTransaction(Bookshelf, container)
  }

  /**
   * Proxy to client.session
   * @see {Client#session}
   */
  bookshelf.session = client.session

  /**
   * Proxy to client.load
   * @see {Client#load}
   */
  bookshelf.load = client.load

  return bookshelf
}

Bookshelf.Model   = Model
Bookshelf.Client  = Client
Bookshelf.Session = Session

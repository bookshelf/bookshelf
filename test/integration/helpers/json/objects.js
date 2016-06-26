// Models used for PostgreSQL jsonb type.
module.exports = function(Bookshelf) {
  var Unit = Bookshelf.Model.extend({
    tableName: 'units',
    commands: function() {
      return this.hasMany(Command);
    }
  });

  var Command = Bookshelf.Model.extend({
    tableName: 'commands',
    unit: function() {
      return this.belongsTo(Unit);
    }
  });

  return {
    Models: {
      Unit: Unit,
      Command: Command
    }
  };

};

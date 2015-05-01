// All Models & Collections Used in the Tests
// (sort of mimics a simple multi-site blogging engine)
module.exports = function(Bookshelf) {

  var _ = require('lodash');

  function _parsed (attributes) {
    var parsed = {};
    Object.keys(attributes).forEach(function (name) {
      parsed[name + "_parsed"] = attributes[name];
    });
    return parsed;
  }

  function _format (attributes) {
    var formatted = {};
    Object.keys(attributes).forEach(function (name) {
      formatted[name.replace('_parsed', '')] = attributes[name];
    });
    return formatted;
  }

  var Info = Bookshelf.Model.extend({
    tableName: 'info'
  });

  var SiteMeta = Bookshelf.Model.extend({
    tableName: 'sitesmeta',
    site: function() {
      return this.belongsTo(Site);
    },
    info: function() {
      return this.hasOne(Info);
    }
  });

  var Uuid = Bookshelf.Model.extend({
    idAttribute: 'uuid',
    tableName: 'uuid_test'
  });

  var Site = Bookshelf.Model.extend({
    tableName: 'sites',
    defaults: {
      name: 'Your Cool Site'
    },
    authors: function() {
      return this.hasMany(Author);
    },
    photos: function() {
      return this.morphMany(Photo, 'imageable');
    },
    thumbnails: function() {
      return this.morphMany(Thumbnail, 'imageable', ["ImageableType", "ImageableId"]);
    },
    blogs: function() {
      return this.hasMany(Blog);
    },
    meta: function() {
      return this.hasOne(SiteMeta);
    },
    info: function() {
      return this.hasOne(Info).through(SiteMeta, 'meta_id');
    },
    admins: function() {
      return this.belongsToMany(Admin).withPivot('item');
    }
  });

  // A SiteParsed appends "_parsed" to each field name on fetch
  // and removes "_parsed" when formatted
  var SiteParsed = Site.extend({
    parse: _parsed,
    format: _format,
    photos: function() {
      return this.morphMany(PhotoParsed, 'imageable');
    }
  });

  var Admin = Bookshelf.Model.extend({
    tableName: 'admins',
    hasTimestamps: true
  });

  // Author of a blog post.
  var Author = Bookshelf.Model.extend({
    tableName: 'authors',
    site: function() {
      return this.belongsTo(Site);
    },
    photo: function() {
      return this.morphOne(Photo, 'imageable');
    },
    thumbnail: function() {
      return this.morphOne(Thumbnail, 'imageable', ["ImageableType", "ImageableId"]);
    },
    posts: function() {
      return this.belongsToMany(Post);
    },
    ownPosts: function() {
      return this.hasMany(Post, 'owner_id');
    },
    blogs: function() {
      return this.belongsToMany(Blog).through(Post, 'owner_id');
    }
  });

  // A AuthorParsed appends "_parsed" to each field name on fetch
  // and removes "_parsed" when formatted
  var AuthorParsed = Author.extend({
    parse: _parsed,
    format: _format,
    photos: function() {
      return this.morphMany(PhotoParsed, 'imageable');
    }
  });

  // A blog for a site.
  var Blog = Bookshelf.Model.extend({
    tableName: 'blogs',
    defaults: {
      title: ''
    },
    site: function() {
      return this.belongsTo(Site);
    },
    posts: function() {
      return this.hasMany(Post);
    },
    parsedPosts: function () {
      return this.hasMany(PostParsed);
    },
    validate: function(attrs) {
      if (!attrs.title) return 'A title is required.';
    },
    comments: function() {
      return this.hasMany(Comment).through(Post);
    }
  });

  // An individual post on a blog.
  var Post = Bookshelf.Model.extend({
    tableName: 'posts',
    defaults: {
      author: '',
      title: '',
      body: '',
      published: false
    },
    hasTimestamps: true,
    blog: function() {
      return this.belongsTo(Blog);
    },
    authors: function() {
      return this.belongsToMany(Author);
    },
    tags: function() {
      return this.belongsToMany(Tag);
    },
    comments: function() {
      return this.hasMany(Comment);
    }
  });

  // A PostParsed appends "_parsed" to each field name on fetch
  var PostParsed = Post.extend({
    parse: _parsed
  });

  var Posts = Bookshelf.Collection.extend({
    model: Post
  });

  var Comment = Bookshelf.Model.extend({
    tableName: 'comments',
    defaults: {
      email: '',
      post: ''
    },
    posts: function() {
      return this.belongsTo(Post);
    },
    blog: function() {
      return this.belongsTo(Blog).through(Post);
    }
  });

  var Tag = Bookshelf.Model.extend({
    tableName: 'tags',
    posts: function() {
      return this.belongsToMany(Post);
    }
  });

  var User = Bookshelf.Model.extend({
    tableName: 'users',
    idAttribute: 'uid',
    roles: function() {
      return this.belongsToMany(Role, 'users_roles', 'uid', 'rid');
    }
  });

  var Role = Bookshelf.Model.extend({
    tableName: 'roles',
    idAttribute: 'rid',
    users: function(){
      return this.belongsToMany(User, 'users_roles', 'rid', 'uid');
    }
  });

  var Photo = Bookshelf.Model.extend({
    tableName: 'photos',
    imageable: function() {
      return this.morphTo('imageable', Site, Author);
    },
    imageableParsed: function() {
      return this.morphTo('imageable', SiteParsed, AuthorParsed);
    }
  });

  var Thumbnail = Bookshelf.Model.extend({
    tableName: 'thumbnails',
    imageable: function() {
      return this.morphTo('imageable', ["ImageableType", "ImageableId"], Site, Author);
    }
  });

  // A PhotoParsed appends "_parsed" to each field name on fetch
  // and removes "_parsed" when formatted
  var PhotoParsed = Photo.extend({
    parse: _parsed,
    format: _format
  });

  var Photos = Bookshelf.Collection.extend({
    model: Photo
  });

  var Settings = Bookshelf.Model.extend({ tableName: 'Settings' });

  var Customer = Bookshelf.Model.extend({
    tableName: 'Customer',
    settings: function () {
      return this.hasOne(Settings);
    }
  });

  var Hostname = Bookshelf.Model.extend({
    tableName: 'hostnames',
    idAttribute: 'hostname',
    instance: function() {
      return this.belongsTo(Instance);
    }
  });

  var Instance = Bookshelf.Model.extend({
    tableName: 'instances',
    hostnames: function() {
      return this.hasMany(Hostname);
    }
  });

  var ParsedModel = Bookshelf.Model.extend({
    format: function (attrs) {
      return _.transform(attrs, function (result, val, key) {
        result[_.snakeCase(key)] = val;
      });
    },
    parse: function (attrs) {
      return _.transform(attrs, function (result, val, key) {
        result[_.camelCase(key)] = val;
      });
    }
  });

  // Has columns: id, user_id, token
  var UserTokenParsed = ParsedModel.extend({
    tableName: 'tokens',
    user: function () {
      return this.belongsTo(UserParsed);
    }
  });

  // Has columns: id, email, first_name, last_name
  var UserParsed = ParsedModel.extend({
    tableName: 'parsed_users',
  });


  /**
   * Issue #578 - lifecycle events on pivot model for belongsToMany().through()
   *
   * Here we bootstrap some models involved in a .belongsToMany().through()
   * relationship. The models are overridden with actual relationship methods
   * e.g. `lefts: function () { return this.belongsToMany(LeftModel).through(JoinModel) }`
   * within the tests to ensure the appropriate lifecycle events are being
   * triggered.
   */

  var LeftModel = Bookshelf.Model.extend({
    tableName: 'lefts'
  });

  var RightModel = Bookshelf.Model.extend({
    tableName: 'rights'
  });

  var JoinModel = Bookshelf.Model.extend({
    tableName: 'lefts_rights',
    defaults: { parsedName: '' },
    format: function (attrs) {
      return _.reduce(attrs, function(memo, val, key) {
        memo[_.snakeCase(key)] = val;
        return memo;
      }, {});
    },
    parse: function (attrs) {
      return _.reduce(attrs, function(memo, val, key) {
        memo[_.camelCase(key)] = val;
        return memo;
      }, {});
    },
    lefts: function() {
      return this.belongsTo(LeftModel);
    },
    rights: function() {
      return this.belongsTo(RightModel);
    }
  });


  return {
    Models: {
      Site: Site,
      SiteParsed: SiteParsed,
      SiteMeta: SiteMeta,
      Admin: Admin,
      Author: Author,
      AuthorParsed: AuthorParsed,
      Blog: Blog,
      Post: Post,
      PostParsed: PostParsed,
      Comment: Comment,
      Tag: Tag,
      User: User,
      UserParsed: UserParsed,
      UserTokenParsed: UserTokenParsed,
      Role: Role,
      Photo: Photo,
      PhotoParsed: PhotoParsed,
      Thumbnail: Thumbnail,
      Info: Info,
      Customer: Customer,
      Settings: Settings,
      Instance: Instance,
      Hostname: Hostname,
      Uuid: Uuid,
      LeftModel: LeftModel,
      RightModel: RightModel,
      JoinModel: JoinModel
    }
  };

};

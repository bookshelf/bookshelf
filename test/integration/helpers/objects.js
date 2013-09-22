
// All Models & Collections Used in the Tests
// (sort of mimics a simple multi-site blogging engine)
module.exports = function(Bookshelf) {

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

  var Sites = Bookshelf.Collection.extend({
    model: Site
  });

  var Admin = Bookshelf.Model.extend({
    tableName: 'admins',
    hasTimestamps: true
  });

  // All admins for a site.
  var Admins = Bookshelf.Collection.extend({
    model: Admin
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

  var Authors = Bookshelf.Collection.extend({
    model: Author
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
    validate: function(attrs) {
      if (!attrs.title) return 'A title is required.';
    },
    comments: function() {
      return this.hasMany(Comments).through(Post);
    }
  });

  var Blogs = Bookshelf.Collection.extend({
    model: Blog
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
    }
  });

  var Comments = Bookshelf.Collection.extend({
    model: Comment
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
     }
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

  return {
    Models: {
      Site: Site,
      SiteMeta: SiteMeta,
      Admin: Admin,
      Author: Author,
      Blog: Blog,
      Post: Post,
      Comment: Comment,
      Tag: Tag,
      User: User,
      Role: Role,
      Photo: Photo,
      Info: Info,
      Customer: Customer,
      Settings: Settings,
      Instance: Instance,
      Hostname: Hostname
    },
    Collections: {
      Sites: Sites,
      Admins: Admins,
      Posts: Posts,
      Blogs: Blogs,
      Comments: Comments,
      Photos: Photos,
      Authors: Authors
    }
  };

};
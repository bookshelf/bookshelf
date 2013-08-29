
// All Models & Collections Used in the Tests
// (sort of mimics a simple multi-site blogging engine)
module.exports = function(Shelf) {

  var Info = Shelf.Model.extend({
    tableName: 'info'
  });

  var SiteMeta = Shelf.Model.extend({
    tableName: 'sitesmeta',
    site: function() {
      return this.belongsTo(Site);
    },
    info: function() {
      return this.hasOne(Info);
    }
  });

  var Site = Shelf.Model.extend({
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

  var Sites = Shelf.Collection.extend({
    model: Site
  });

  var Admin = Shelf.Model.extend({
    tableName: 'admins',
    hasTimestamps: true
  });

  // All admins for a site.
  var Admins = Shelf.Collection.extend({
    model: Admin
  });

  // Author of a blog post.
  var Author = Shelf.Model.extend({
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

  var Authors = Shelf.Collection.extend({
    model: Author
  });

  // A blog for a site.
  var Blog = Shelf.Model.extend({
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

  var Blogs = Shelf.Collection.extend({
    model: Blog
  });

  // An individual post on a blog.
  var Post = Shelf.Model.extend({
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

  var Posts = Shelf.Collection.extend({
    model: Post
  });

  var Comment = Shelf.Model.extend({
    tableName: 'comments',
    defaults: {
      email: '',
      post: ''
    },
    posts: function() {
      return this.belongsTo(Post);
    }
  });

  var Comments = Shelf.Collection.extend({
    model: Comment
  });

  var Tag = Shelf.Model.extend({
    tableName: 'tags',
    posts: function() {
      return this.belongsToMany(Post);
    }
  });

  var User = Shelf.Model.extend({
    tableName: 'users',
    idAttribute: 'uid',
    roles: function() {
      return this.belongsToMany(Role, 'users_roles', 'uid', 'rid');
    }
  });

  var Role = Shelf.Model.extend({
    tableName: 'roles',
    idAttribute: 'rid',
    users: function(){
      return this.belongsToMany(User, 'users_roles', 'rid', 'uid');
    }
  });

  var Photo = Shelf.Model.extend({
    tableName: 'photos',
    imageable: function() {
      return this.morphTo('imageable', Site, Author);
     }
   });

  var Photos = Shelf.Collection.extend({
    model: Photo
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
      Info: Info
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
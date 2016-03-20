/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Category = require('../api/classified/category.model');
var Classified = require('../api/classified/classified.model').model;
var User = require('../api/user/user.model').model;
var async = require('async');

/*
//code to generate random classifieds for testing
function randomIntFromInterval(min,max)
{
  return Math.floor(Math.random()*(max-min+1)+min);
}
function randomDate(withinDays,direction)
{
  var date = new Date();
  if(direction=='-')
    date.setDate(date.getDate()-randomIntFromInterval(0,withinDays));
  else if(direction=='+')
    date.setDate(date.getDate()+randomIntFromInterval(0,withinDays));
  else
    date.setDate(date.getDate()+(randomIntFromInterval(-withinDays,withinDays)));
  return date
}
function randomAlphanumericString(length) {
  var chars='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = length; i > 0; --i) result += chars[randomIntFromInterval(0,chars.length-1)];
  return result;
}
var categories = [];
var users = [];
var imagesArray = [
  [255,216,255,224,0,16,74,70,73,70,0,1,1,2,0,37,0,37,0,0,255,219,0,67,0,16,11,12,14,12,10,16,14,13,14,18,17,16,19,24,40,26,24,22,22,24,49,35,37,29,40,58,51,61,60,57,51,56,55,64,72,92,78,64,68,87,69,55,56,80,109,81,87,95,98,103,104,103,62,77,113,121,112,100,120,92,101,103,99,255,219,0,67,1,17,18,18,24,21,24,47,26,26,47,99,66,56,66,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,255,192,0,17,8,0,100,0,100,3,1,34,0,2,17,1,3,17,1,255,196,0,27,0,1,0,1,5,1,0,0,0,0,0,0,0,0,0,0,0,0,6,1,2,3,4,5,7,255,196,0,40,16,0,2,2,2,1,4,2,1,4,3,0,0,0,0,0,0,0,1,2,3,4,17,5,6,18,19,33,49,65,81,20,22,34,129,97,145,193,255,196,0,20,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,196,0,20,17,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,218,0,12,3,1,0,2,17,3,17,0,63,0,244,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,13,108,233,228,215,141,41,97,215,85,150,175,125,182,205,197,107,239,218,76,13,144,70,163,212,57,223,183,227,202,89,137,141,21,108,171,85,71,204,245,169,75,79,185,235,214,191,179,46,87,61,145,135,129,77,183,67,9,217,117,254,24,202,25,13,211,31,91,220,167,175,95,232,9,0,56,60,151,45,200,224,240,241,207,88,184,150,40,45,218,149,237,175,148,147,139,81,246,158,254,244,87,147,228,249,78,59,2,156,137,226,98,74,114,177,87,56,171,229,164,229,36,163,167,219,239,231,223,253,3,186,14,13,188,245,184,188,205,60,118,86,60,35,43,49,251,221,144,155,113,86,127,45,71,218,248,125,175,76,195,87,81,228,229,215,91,196,198,199,77,81,93,183,206,251,252,112,131,154,218,130,122,123,122,2,72,11,42,147,157,80,147,73,57,69,54,147,218,95,223,217,120,0,0,0,0,2,217,199,186,18,138,251,77,23,20,2,63,103,79,223,46,150,198,226,149,180,202,218,92,27,148,226,220,37,219,45,233,175,193,149,113,252,132,56,207,211,215,87,19,6,230,220,234,88,242,241,74,47,252,111,231,103,108,1,30,93,57,100,58,94,254,42,23,195,201,116,156,251,148,90,132,27,146,150,162,190,146,209,181,212,28,126,119,35,143,85,24,150,99,194,17,156,108,155,182,50,111,113,105,173,107,235,215,179,174,0,143,231,240,57,28,139,200,178,251,170,133,246,227,87,8,202,180,245,11,97,39,46,229,191,175,102,165,157,45,149,12,25,99,227,221,139,37,126,60,41,190,55,212,228,148,163,30,213,56,126,30,191,36,172,1,139,22,175,6,53,84,247,119,120,224,163,189,124,233,104,204,80,168,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,31,255,217],
  [255,216,255,224,0,16,74,70,73,70,0,1,1,0,0,1,0,1,0,0,255,219,0,67,0,16,11,12,14,12,10,16,14,13,14,18,17,16,19,24,40,26,24,22,22,24,49,35,37,29,40,58,51,61,60,57,51,56,55,64,72,92,78,64,68,87,69,55,56,80,109,81,87,95,98,103,104,103,62,77,113,121,112,100,120,92,101,103,99,255,219,0,67,1,17,18,18,24,21,24,47,26,26,47,99,66,56,66,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,255,192,0,17,8,0,100,0,100,3,1,17,0,2,17,1,3,17,1,255,196,0,25,0,0,3,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,2,3,0,4,5,255,196,0,45,16,0,2,1,2,4,4,6,3,1,0,3,0,0,0,0,0,1,2,0,3,17,4,18,33,49,19,65,81,97,5,20,34,66,113,129,50,82,145,161,35,36,241,255,196,0,22,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,255,196,0,27,17,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,17,1,18,2,33,3,34,255,218,0,12,3,1,0,2,17,3,17,0,63,0,247,208,37,20,189,172,122,72,166,90,148,219,91,237,214,3,26,137,148,145,168,237,2,85,94,147,166,172,69,245,176,129,5,32,213,2,155,5,176,220,194,194,212,170,213,14,64,217,141,254,140,17,90,52,217,65,45,234,248,55,146,134,24,114,236,42,102,32,111,222,40,199,13,76,2,193,110,123,157,226,129,193,122,131,241,8,34,138,45,0,186,179,19,243,32,109,61,162,240,129,110,242,142,20,96,237,169,37,143,184,153,85,107,134,66,169,119,107,233,166,146,82,38,41,214,189,172,114,175,88,171,20,167,64,212,36,220,27,244,146,145,110,26,162,50,95,150,231,83,20,77,120,121,115,48,214,214,176,138,177,74,42,140,166,205,151,252,146,145,86,122,104,46,88,159,184,72,83,93,65,252,79,217,180,17,7,197,177,232,59,8,88,67,137,98,61,52,175,220,235,9,11,255,0,98,166,166,224,74,66,240,200,252,170,235,207,156,82,59,41,225,233,41,1,183,229,37,85,26,152,39,40,80,7,59,73,72,6,152,0,133,54,59,117,138,176,41,210,42,13,205,133,237,220,201,86,51,80,85,7,114,12,85,137,50,49,26,29,34,172,0,93,116,81,169,147,163,146,149,171,123,182,253,76,116,188,136,195,51,234,199,251,29,36,197,60,189,53,29,76,84,98,109,248,169,54,216,69,33,10,177,213,142,189,204,181,32,4,176,208,143,236,149,32,54,32,147,233,91,119,134,161,211,18,0,25,154,240,176,222,100,95,75,252,72,188,183,29,207,254,73,87,150,82,231,91,15,185,42,200,107,190,164,176,61,173,37,92,194,241,42,141,180,248,17,90,227,3,61,65,208,69,56,77,222,161,230,98,156,98,44,207,205,143,246,90,156,226,121,200,59,255,0,76,181,158,112,13,98,61,194,84,133,53,79,236,96,141,230,175,206,88,153,162,43,142,210,70,179,78,184,128,57,201,22,152,98,135,81,36,46,15,154,31,180,67,227,121,181,30,233,57,214,179,146,156,106,143,116,115,171,124,166,254,35,76,110,210,241,169,222,34,254,39,79,169,63,83,92,107,59,250,98,45,226,73,200,55,242,92,240,206,254,137,55,136,3,178,25,174,25,223,105,156,121,228,135,251,47,12,246,79,60,255,0,175,251,47,41,210,9,226,12,233,157,80,229,234,72,17,19,160,30,32,229,194,133,23,58,15,86,241,48,235,85,227,226,127,85,31,102,38,53,116,30,190,44,15,74,41,237,115,39,194,233,184,184,163,181,21,251,120,248,191,92,134,183,137,184,183,12,13,246,143,137,253,36,7,137,21,2,237,110,246,188,183,18,122,21,165,226,55,213,237,242,68,92,94,125,58,169,37,96,159,242,217,155,168,22,146,225,52,188,10,217,137,46,196,29,133,134,146,220,78,116,69,39,27,150,63,49,82,106,79,133,47,111,83,139,30,178,211,145,24,91,0,45,183,83,21,57,116,174,6,152,162,41,229,244,204,214,243,206,53,63,12,164,174,172,162,217,72,34,103,166,179,198,59,150,128,60,164,233,190,84,24,126,210,116,67,138,3,164,149,115,48,227,14,189,4,205,111,32,240,20,114,146,175,192,106,11,204,8,186,179,19,106,40,37,169,49,38,69,19,85,157,204,76,168,150,177,10,84,75,82,23,44,84,116,222,222,211,17,51,76,128,188,53,86,20,200,231,50,189,24,43,196,58,16,92,25,34,211,103,55,222,33,154,70,35,155,73,26,232,140,234,61,210,196,232,9,70,247,218,88,207,90,83,77,72,252,165,137,210,102,152,190,242,198,105,108,183,212,68,74,222,142,113,10,170,214,86,182,160,94,106,51,84,204,21,52,181,226,21,184,234,70,242,69,164,243,68,84,177,210,57,40,182,33,128,181,180,136,84,158,169,44,70,160,203,14,147,86,37,236,215,136,116,118,165,189,140,67,164,202,19,44,78,138,85,215,98,127,145,19,160,6,175,91,252,152,133,2,213,71,32,126,34,37,41,118,230,32,174,116,102,26,94,211,81,43,161,94,246,5,141,196,66,149,170,84,45,101,38,33,67,61,64,65,191,170,33,71,204,189,253,68,219,226,33,66,165,102,39,48,220,196,43,46,35,49,25,155,88,133,87,143,151,83,180,145,43,28,74,129,123,233,17,105,14,32,182,199,251,17,0,98,77,237,105,96,126,40,59,139,68,27,136,58,196,18,74,138,61,38,210,161,178,165,243,127,144,29,93,122,90,0,44,46,108,4,14,106,196,173,201,58,64,144,196,34,233,148,147,214,240,27,58,17,125,160,57,172,164,117,129,23,96,123,64,147,177,190,242,133,206,115,111,2,131,20,87,67,175,220,128,156,95,104,131,163,50,137,80,120,186,64,153,118,190,240,9,170,219,90,4,106,84,44,44,78,176,57,204,5,12,96,85,42,88,64,99,86,251,192,155,16,96,2,96,33,128,47,3,180,19,3,18,109,1,115,27,192,5,140,9,57,214,84,11,105,10,28,160,3,34,8,218,21,136,180,160,24,10,100,2,7,255,217]
];
async.waterfall(
  [
    function(callback) {
      Category.find({},function(err,_categories) {
        for(var i=0; i<_categories.length; i++)
          categories.push(String(_categories[i]._id));
        callback(null);
      });
    },
    function(callback) {
      User.find({},function(err,_users) {
        for(var i=0; i<_users.length; i++)
          users.push(String(_users[i]._id));
        callback(null);
      });
    },
    function() {

      for(var i=0; i<200; i++) {
        var images = [];
        if(i%2==0)
        {
          for(var j=0; j<randomIntFromInterval(0,10); j++)
          {
            var randomImageIndex = randomIntFromInterval(0,imagesArray.length-1);
            images.push({"thumbnail":{"data": new Buffer(new Uint8Array(imagesArray[randomImageIndex]))},"image":{"data": new Buffer(new Uint8Array(imagesArray[randomImageIndex]))}});
          }
        }
        var selectedCategories = [];
        for(var j=0; j<randomIntFromInterval(0,categories.length); j++)
        {
          var randomCategory = categories[randomIntFromInterval(0,categories.length-1)];
          var found = false;
          for(var x=0;x<selectedCategories.length;x++) {
            if (selectedCategories[x] == randomCategory)
              found = true;
          }
          if(!found)
            selectedCategories.push(randomCategory);
        }

        var opts = {
          title: i+" "+randomAlphanumericString(32),
          location: (i%3==0?null:randomAlphanumericString(32)),
          contact: (i%3==0?null:randomAlphanumericString(32)),
          content: randomAlphanumericString(500),
          posted: (i%5==0?null:randomDate(100,'-')),
          categories: selectedCategories,
          images: images
        };
        if(i%5==0)
        {
          opts.email=randomAlphanumericString(randomIntFromInterval(3,8))+ "@" + randomAlphanumericString(randomIntFromInterval(3,8)) + ".com";
        }
        else
          opts.user=users[randomIntFromInterval(0,users.length-1)]

        Classified.create(opts, function (err,classified) {
        });
      }
    }
  ]);
*/

/*
//code to generate random users for testing
function randomIntFromInterval(min,max)
{
  return Math.floor(Math.random()*(max-min+1)+min);
}
function randomDate(withinDays,direction)
{
  var date = new Date();
  if(direction=='-')
    date.setDate(date.getDate()-randomIntFromInterval(0,withinDays));
  else if(direction=='+')
    date.setDate(date.getDate()+randomIntFromInterval(0,withinDays));
  else
    date.setDate(date.getDate()+(randomIntFromInterval(-withinDays,withinDays)));
  return date
}
function randomAlphanumericString(length) {
  var chars='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = length; i > 0; --i) result += chars[randomIntFromInterval(0,chars.length-1)];
  return result;
}
for(var i=0; i<100; i++) {
  var opts = {
    email: randomAlphanumericString(randomIntFromInterval(3,8))+ "@" + randomAlphanumericString(randomIntFromInterval(3,8)) + ".com",
    language: randomIntFromInterval(0,1)==0?'en':'fr',
    verified: randomIntFromInterval(0,1)==0?false:true,
    approved: randomIntFromInterval(0,1)==0?false:true,
    permanent: randomIntFromInterval(0,9)==0?true:false,
    emailSubscriptions : randomIntFromInterval(0,1)==0?["all"]:[],
    created: randomDate(100,'-'),
  };
  if(randomIntFromInterval(0,1)==0) {
    opts.provider='local';
    opts.password = opts.email;
  }
  else
  {
    opts.provider='facebook';
  }
  if(randomIntFromInterval(0,1)==0) {
    opts.name=randomAlphanumericString(randomIntFromInterval(3,8)) +" "+ randomAlphanumericString(randomIntFromInterval(3,8));
    opts.role=randomIntFromInterval(0,9)==0?'admin':'user';
  }
  else
  {
    opts.role='email';
  }

  User.create(opts, function (err,user) {
  });
}
*/


async.waterfall(
  [
    function(callback)
    {
      Category.count({},function(err, count)
      {
        if(count==0)
        {
          Category.create(
            {
              title:
                [
                  {
                    language: 'en',
                    value: 'Events'
                  },
                  {
                    language: 'fr',
                    value: 'Evénements'
                  }
                ],
              sort: 1,
              icon: 'music'
            },
            {
              title:
                [
                  {
                    language: 'en',
                    value: 'Housing'
                  },
                  {
                    language: 'fr',
                    value: 'Logements'
                  }
                ],
              sort: 2,
              icon: 'home'
            },{
              title:
                [
                  {
                    language: 'en',
                    value: 'Vehicle'
                  },
                  {
                    language: 'fr',
                    value: 'Vehicules'
                  }
                ],
              sort: 3,
              icon: 'car'
            },
            {
              title:
                [
                  {
                    language: 'en',
                    value: 'Furniture'
                  },
                  {
                    language: 'fr',
                    value: 'Meubles'
                  }
                ],
              sort: 4,
              icon: 'bed'
            },
            {
              title:
                [
                  {
                    language: 'en',
                    value: 'Home appliance'
                  },
                  {
                    language: 'fr',
                    value: 'Electroménager'
                  }
                ],
              sort: 5,
              icon: 'plug'
            },
            {
              title:
                [
                  {
                    language: 'en',
                    value: 'High tech'
                  },
                  {
                    language: 'fr',
                    value: 'High tech'
                  }
                ],
              sort: 6,
              icon: 'mobile'
            },
            {
              title:
                [
                  {
                    language: 'en',
                    value: 'Hobbies'
                  },
                  {
                    language: 'fr',
                    value: 'Loisirs'
                  }
                ],
              sort: 7,
              icon: 'futbol-o'
            },
            {
              title:
                [
                  {
                    language: 'en',
                    value: 'Services'
                  },
                  {
                    language: 'fr',
                    value: 'Services'

                  }
                ],
              sort: 8,
              icon: 'thumbs-up'
            },
            {
              title:
                [
                  {
                    language: 'en',
                    value: 'Jobs'
                  },
                  {
                    language: 'fr',
                    value: 'Emplois'
                  }
                ],
              sort: 9,
              icon: 'briefcase'
            },
            {
              title:
                [
                  {
                    language: 'en',
                    value: 'Free'
                  },
                  {
                    language: 'fr',
                    value: 'Gratuit'
                  }
                ],
              sort: 10,
              icon: 'gift'
            },{
              title:
                [
                  {
                    language: 'en',
                    value: 'Wanted'
                  },
                  {
                    language: 'fr',
                    value: 'Recherche'
                  }
                ],
              sort: 11,
              icon: 'group'
            },
            {
              title:
                [
                  {
                    language: 'en',
                    value: 'Other'
                  },
                  {
                    language: 'fr',
                    value: 'Autres'
                  }
                ],
              sort: 12,
              icon: 'unsorted'
            },
            function() {
              console.log('Populated categories.');
              callback(null);
            }
          );
        }
        else
          callback(null);
      });
    },
    function(callback)
    {
      User.count({},function(err, count)
      {
        if(count==0)
        {
          if(process.env.NODE_ENV=='development' || process.env.NODE_ENV=='test')
          {
            User.create({
                provider: 'local',
                name: 'Test User',
                email: 'test@test.com',
                password: 'test',
                permanent: true,
                language: 'en',
                approved: true,
                verified: true
              }, {
                provider: 'local',
                role: 'admin',
                name: 'Admin',
                email: 'admin@admin.com',
                password: 'admin',
                permanent: true,
                language: 'en',
                approved: true,
                verified: true
              }, function() {
                console.log('Populated development users.');
                callback(null);
              }
            );
          }
          else if(process.env.NODE_ENV=='production')
          {
            User.create({
                provider: 'local',
                role: 'admin',
                name: 'Production User',
                email: 'user@classact.com',
                password: 'classact',
                permanent: true,
                language: 'en',
                approved: true,
                verified: true
              }, function() {
                console.log('Populated production users.');
                callback(null);
              }
            );
          }
        }
        else
          callback(null);
      });
    },
    function()
    {
      Classified.count({},function(err, count)
      {
        if(count==0)
        {
          if(process.env.NODE_ENV=='development' || process.env.NODE_ENV=='test')
          {
            User.findOne({email: 'test@test.com'}, function(err, user) {
              Category.find({$or: [{'title.value': 'Other'},{'title.value': 'Events'}]},function(err,categories) {
                Classified.create({
                  title : 'Development Tools',
                  content : 'Integration with popular tools such as Bower, Grunt, Karma, Mocha, JSHint, Node Inspector, Livereload, Protractor, Jade, Stylus, Sass, CoffeeScript, and Less.',
                  posted : new Date(),
                  user: user,
                  categories: categories,
                }, {
                  title : 'Server and Client integration',
                  content : 'Built with a powerful and fun stack: MongoDB, Express, AngularJS, and Node.',
                  posted : new Date(),
                  user: user,
                  categories: categories,
                }, {
                  title : 'Smart Build System',
                  content : 'Build system ignores `spec` files, allowing you to keep tests alongside code. Automatic injection of scripts and styles into your index.html',
                  posted : new Date(),
                  user: user,
                  categories: categories,
                },  {
                  title : 'Modular Structure',
                  content : 'Best practice client and server structures allow for more code reusability and maximum scalability',
                  posted : new Date(),
                  user: user,
                  categories: categories,
                },  {
                  title : 'Optimized Build',
                  content : 'Build process packs up your templates as a single JavaScript payload, minifies your scripts/css/images, and rewrites asset names for caching.',
                  posted : new Date(),
                  user: user,
                  categories: categories,
                },{
                  title : 'Deployment Ready',
                  content : 'Easily deploy your app to Heroku or Openshift with the heroku and openshift subgenerators',
                  posted : new Date(),
                  user: user,
                  categories: categories,
                },function() {
                  console.log('Populated development classifieds.');
                });
              });
            });
          }
          else if(process.env.NODE_ENV=='production')
          {
            User.find({permanent: true}, function(err, users) {
              Category.find({$or: [{'title.value': 'Other'},{'title.value': 'Events'}]},function(err,categories) {
                for(var i=0; i<users.length; i++)
                {
                  var user = users[i];
                  Classified.create({
                    title : 'Automated test classified posted under '+user.name+'\'s account',
                    content : 'Testing... 1...2...3\n\nWelcome to ClassAct!',
                    posted : new Date(),
                    user: user,
                    categories: categories,
                  },function() {
                    console.log('Populated production classified.');
                  });
                }
              });
            });
          }
        }
      });
    }
  ]
);





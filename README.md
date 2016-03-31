# ClassAct v1.0.0

## Synopsis

**ClassAct** is a simple, clean and easy to use platform for posting classifieds with image attachments, available in multiple languages. It allows users to register their email or create an account, using an email verification process. Users can post classifieds which are listed publicly on the homepage. The classifieds are searchable and can be narrowed down using categories. **ClassAct** also gives a rich set of functionality to one or multiple administrators, allowing full control over the management of classifieds and users. Furthermore, it can generate regular email digests consisting of the latest classifieds, chosen by the administrator, to all subscribed users. Users have the capability to change their email subscription, change their password, reset their forgotten password, or delete their account. 


## Technical Features

- Built entirely in MEAN (MongoDB, Express.js, Angular.js, Node.js)
- Seeded using the AngularJS Full-Stack generator: https://github.com/angular-fullstack/generator-angular-fullstack
- Single page-application
- Support for Google Analytics
- Full i18n support: language, dates, etc
- Live data synchronization: all data kept fully updated at all times in all clients using websockets
- Responsive: scales and renders will from large displays, down to tablets, down to small phones
- OAuth 2.0 support: Facebook Login
- Quick, powerful, performant: leveraging Node.js, and asynchronous javascript up and down the stack
- Ready for deployment to OpenShift


## Technologies Used

- MEAN
- Bootstrap UI
- ImageMagick


## Demo

- Testing website: http://bamakoolstaging-synappze.rhcloud.com
- Live production website: http://www.bamakool.com 
- Screenshots
  * ![Screenshot 1](screenshots/screenshot1.png?raw=true "Screenshot 1")
  
  * ![Screenshot 1](screenshots/screenshot2.png?raw=true "Screenshot 2")


## Developer's Guide

- Developing and running locally 
  * (Coming soon)
    
- Adding a new language
  * Translations exist both in the client and the server
  * Both places you can add a language simply by adding a two letter language code (ISO 639-1, https://en.wikipedia.org/wiki/ISO_639-1). For example, en for English, or fr for French. 
  * Be sure to copy and translate all existing keys for it to work correctly. (for example, {HELLO: "Hello"} for English, or {HELLO: "Bonjour"} for French)
  * To add translations in the client side, edit client/app/app.js. Scroll down to the .config() section, and you'll see an object called "translations", which has two letter language codes that map to a JSON of translations for that language. To add a language with code xx, add translations['xx']={} with all the keys from the other languages copies and translated to your new language.
  * In the client side app.js, also add 

- Customizing settings
  * (Coming soon)
  
- Deploying to OpenShift
  * (Coming soon)

-Deploying code updates


## User and Administrator Guide

Coming soon to a GitHub near you.git checkout github


## Contributors

**Author:** Adeel Mufti. The author of this project encourages contributions of code improvements, new features, bug fixes, etc., from the GitHub developer community.   
**French Translations:** Christophe Perotin.

## License

Licensed under the [Apache License](LICENSE.md)

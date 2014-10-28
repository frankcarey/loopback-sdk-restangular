loopback-sdk-restangular
========================

A restangular oriented sdk that uses restangular
=======
A restangular oriented loopback sdk that uses restangular instead of $resource

It's intended as an alternative to the official angular sdk generator at https://github.com/strongloop/loopback-sdk-angular

WHY?
-----

Because restangular is a more pleasant developer experience basically. See this article - http://www.ng-newsletter.com/posts/restangular.html

It also simplifies interacting with the loopback Rest API significantly, and doesn't require all the boilerplate code that the generator creates. The generator is fine since you don't need to create all that code by hand, and you get some documentation, but with restangular you can do the same things with much less code and it's MUCH easier to understand and extend (IMO).

Goals
-----

* The hope is to have standard functions where possbile.
* Be a drop in replacement, at least for the auth functionality.
* Contribute code back to the official sdk.
* Be a standard component that you download through bower (no generation steps needed).
* Be easy to extend and make things like auth more flexible and robust.
* Not focus on generation of documentation and code like the offical repo does (but hopefully be able to use both)

DO NOT USE IN PRODUCTION
----------------------

This is a very early version with no tests and other sane things!

Documentation
=============

You probably want to ready about restangular first.
Article - http://www.ng-newsletter.com/posts/restangular.html
Documentation - https://github.com/mgonto/restangular

Adding this to your project
--------------------------

### Installing

    bower install loopback-sdk-restangular

Ensure that the script src is added to your html.

### Adding to angular

Add the dependencies to your app module.

```Javascript
// Probably in app.js
angular.module('myApp', [
  //...
  'restangular',
  'loopbackAuth.restangular',
])
...
```

Using the API
------------




#Ember

概念介绍

*   绑定（Bindings）:某model的属性的值随着另一个model的改变（单向，双向） 单向App.userView = Ember.View.create({userNameBinding: Ember.Binding.oneWay('App.user.fullName')});
*   计算属性（Computed properties）：某属性的值是一个函数的返回值，函数中可以引用其他属性 
		> Person = Ember.Object.extend({
		  // these will be supplied by `create`
			  firstName: null,
			  lastName: null,

			  fullName: function() {
				var firstName = this.get('firstName');
				var lastName = this.get('lastName');

				return firstName + ' ' + lastName;
			  }.property('firstName', 'lastName')
			});

			var person = Person.create({
			  firstName: "Yehuda",
			  lastName: "Katz"
			});

			person.addObserver('fullName', function() {
			  // deal with the change
			});

		person.set('firstName', "Brohuda"); // observer will fire
*   自动更新模板（Auto-updating templates）

*  创建类 var Peo = Ember.Object.extend({})
*  继承 var CoolPeo = Peo.extend()
*  给类追加属性,方法 Person.reopen({})
*  创建对象 var peo = Peo.create()：在创建对象时可以新增和覆盖属性，方法
*  访问对象属性 peo.get(key) peo.set(key,val)
  

##资源
* [官网](http://emberjs.com/)
* [中文的](http://emberjs.cn/blog/)  
* [tutsplus](http://net.tutsplus.com/tutorials/javascript-ajax/resources-to-get-you-up-to-speed-in-ember-js/)
* [教程:emberwatch](http://emberwatch.com/#tutorials)
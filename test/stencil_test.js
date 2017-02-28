import QUnit from 'steal-qunit';
import DefineMap from 'can-define/map/map';
import DefineList from 'can-define/list/list';
import domDispatch from 'can-util/dom/dispatch/dispatch';
import compute from 'can-compute';

import h from '../../lib/stencil';

QUnit.module('stencil');

QUnit.test('live binding - text node (compute)', () => {
  const message = compute(`Hello, World!`);

  const view = data => {
    return h('h1.big-h1', {}, [ message ]);
  };

  const frag = view({});
  QUnit.equal(frag.tagName, 'H1');
  QUnit.equal(frag.innerHTML, 'Hello, World!');
  QUnit.equal(frag.className, 'big-h1');

  message(`Hello, Mars!`);
  QUnit.equal(frag.tagName, 'H1');
  QUnit.equal(frag.innerHTML, 'Hello, Mars!');
  QUnit.equal(frag.className, 'big-h1');
});

QUnit.test('live binding - text node', () => {
  const data = new DefineMap({
    message: 'World'
  });

  const view = data => {
    return h('h1.big-h1', {}, [
      () => `Hello, ${data.message}!`
    ]);
  };

  const frag = view(data);
  QUnit.equal(frag.tagName, 'H1');
  QUnit.equal(frag.innerHTML, 'Hello, World!');
  QUnit.equal(frag.className, 'big-h1');

  data.message = 'Mars';
  QUnit.equal(frag.tagName, 'H1');
  QUnit.equal(frag.innerHTML, 'Hello, Mars!');
  QUnit.equal(frag.className, 'big-h1');
});

QUnit.test('live binding - attribute', () => {
  const data = new DefineMap({
    class: 'big-h1'
  });

  const view = data => {
    return h('h1', { class: () => data.class }, [
      'Hello, World!'
    ]);
  };

  const frag = view(data);
  QUnit.equal(frag.tagName, 'H1');
  QUnit.equal(frag.innerHTML, 'Hello, World!');
  QUnit.equal(frag.className, 'big-h1');

  data.class = 'small-h1';
  QUnit.equal(frag.tagName, 'H1');
  QUnit.equal(frag.innerHTML, 'Hello, World!');
  QUnit.equal(frag.className, 'small-h1');
});

QUnit.test('live binding - children', () => {
  const Scope = DefineMap.extend({
    children: DefineList
  });
  const data = new Scope({
    children: [ 'First', 'Second' ]
  });

  const view = data => {
    return h('ul', {}, () => data.children.map(child =>
        h('li', {}, [ `${child} List Item` ])));
  };

  const frag = view(data);

  QUnit.equal(frag.tagName, 'UL');

  QUnit.equal(frag.children[0].tagName, 'LI');
  QUnit.equal(frag.children[0].innerHTML, 'First List Item');

  QUnit.equal(frag.children[1].tagName, 'LI');
  QUnit.equal(frag.children[1].innerHTML, 'Second List Item');

  data.children.push('Third');
  QUnit.equal(frag.tagName, 'UL');

  QUnit.equal(frag.children[0].tagName, 'LI');
  QUnit.equal(frag.children[0].innerHTML, 'First List Item');

  QUnit.equal(frag.children[1].tagName, 'LI');
  QUnit.equal(frag.children[1].innerHTML, 'Second List Item');

  QUnit.equal(frag.children[2].tagName, 'LI');
  QUnit.equal(frag.children[2].innerHTML, 'Third List Item');
});

QUnit.test('event handling - can call function from data object', () => {
  const data = new DefineMap({
    count: 0,
    plus() {
      QUnit.ok(true, 'plus called');
      this.count++;
    }
  });

  const view = data => {
    return h('div', {}, [
      h('p', {}, [ () => `Count: ${data.count}` ]),
      h('input', { type: 'submit', onclick: data.plus }, [ 'Click Me!' ])
    ])
  };

  const frag = view(data);

  QUnit.equal(frag.children[0].innerHTML, 'Count: 0');

  const button = frag.children[1];
  domDispatch.call(button, 'click');
});

QUnit.test('event handling - can update data from event handler', () => {
  const Data = DefineMap.extend({
    count: {
      set(val) {
        QUnit.equal(val, 5, 'count set to 5');
        return val
      }
    }
  });

  const view = data => {
    return h('div', {}, [
      h('p', {}, [ () => `Count: ${data.count}` ]),
      h('input', { type: 'submit', onclick: () => {
        data.count = 5;
      } }, [ 'Click Me!' ])
    ])
  };

  const frag = view(new Data());

  const button = frag.children[1];
  domDispatch.call(button, 'click');
});

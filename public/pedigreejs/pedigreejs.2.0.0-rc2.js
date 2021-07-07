var pedigreejs = (function (exports) {
  'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  //store a history of pedigree
  var max_limit = 25;
  var dict_cache = {}; // test if browser storage is supported

  function has_browser_storage(opts) {
    try {
      if (opts.store_type === 'array') return false;
      if (opts.store_type !== 'local' && opts.store_type !== 'session' && opts.store_type !== undefined) return false;
      var mod = 'test';
      localStorage.setItem(mod, mod);
      localStorage.removeItem(mod);
      return true;
    } catch (e) {
      return false;
    }
  }

  function get_prefix(opts) {
    return "PEDIGREE_" + opts.btn_target + "_";
  } // use dict_cache to store cache as an array


  function get_arr(opts) {
    return dict_cache[get_prefix(opts)];
  }

  function get_browser_store(opts, item) {
    if (opts.store_type === 'local') return localStorage.getItem(item);else return sessionStorage.getItem(item);
  }

  function set_browser_store(opts, name, item) {
    if (opts.store_type === 'local') return localStorage.setItem(name, item);else return sessionStorage.setItem(name, item);
  } // clear all storage items


  function clear_browser_store(opts) {
    if (opts.store_type === 'local') return localStorage.clear();else return sessionStorage.clear();
  } // remove all storage items with keys that have the pedigree history prefix


  function clear_pedigree_data(opts) {
    var prefix = get_prefix(opts);
    var store = opts.store_type === 'local' ? localStorage : sessionStorage;
    var items = [];

    for (var i = 0; i < store.length; i++) {
      if (store.key(i).indexOf(prefix) == 0) items.push(store.key(i));
    }

    for (var _i = 0; _i < items.length; _i++) {
      store.removeItem(items[_i]);
    }
  }
  function get_count(opts) {
    var count;
    if (has_browser_storage(opts)) count = get_browser_store(opts, get_prefix(opts) + 'COUNT');else count = dict_cache[get_prefix(opts) + 'COUNT'];
    if (count !== null && count !== undefined) return count;
    return 0;
  }

  function set_count(opts, count) {
    if (has_browser_storage(opts)) set_browser_store(opts, get_prefix(opts) + 'COUNT', count);else dict_cache[get_prefix(opts) + 'COUNT'] = count;
  }

  function init_cache(opts) {
    if (!opts.dataset) return;
    var count = get_count(opts);

    if (has_browser_storage(opts)) {
      // local storage
      set_browser_store(opts, get_prefix(opts) + count, JSON.stringify(opts.dataset));
    } else {
      // TODO :: array cache
      console.warn('Local storage not found/supported for this browser!', opts.store_type);
      max_limit = 500;
      if (get_arr(opts) === undefined) dict_cache[get_prefix(opts)] = [];
      get_arr(opts).push(JSON.stringify(opts.dataset));
    }

    if (count < max_limit) count++;else count = 0;
    set_count(opts, count);
  }
  function nstore(opts) {
    if (has_browser_storage(opts)) {
      for (var i = max_limit; i > 0; i--) {
        if (get_browser_store(opts, get_prefix(opts) + (i - 1)) !== null) return i;
      }
    } else {
      return get_arr(opts) && get_arr(opts).length > 0 ? get_arr(opts).length : -1;
    }

    return -1;
  }
  function current(opts) {
    var current = get_count(opts) - 1;
    if (current == -1) current = max_limit;
    if (has_browser_storage(opts)) return JSON.parse(get_browser_store(opts, get_prefix(opts) + current));else if (get_arr(opts)) return JSON.parse(get_arr(opts)[current]);
  }
  function last(opts) {
    if (has_browser_storage(opts)) {
      for (var i = max_limit; i > 0; i--) {
        var it = get_browser_store(opts, get_prefix(opts) + (i - 1));

        if (it !== null) {
          set_count(opts, i);
          return JSON.parse(it);
        }
      }
    } else {
      var arr = get_arr(opts);
      if (arr) return JSON.parse(arr(arr.length - 1));
    }

    return undefined;
  }
  function previous(opts, previous) {
    if (previous === undefined) previous = get_count(opts) - 2;

    if (previous < 0) {
      var _nstore = _nstore(opts);

      if (_nstore < max_limit) previous = _nstore - 1;else previous = max_limit - 1;
    }

    set_count(opts, previous + 1);
    if (has_browser_storage(opts)) return JSON.parse(get_browser_store(opts, get_prefix(opts) + previous));else return JSON.parse(get_arr(opts)[previous]);
  }
  function next(opts, next) {
    if (next === undefined) next = get_count(opts);
    if (next >= max_limit) next = 0;
    set_count(opts, parseInt(next) + 1);
    if (has_browser_storage(opts)) return JSON.parse(get_browser_store(opts, get_prefix(opts) + next));else return JSON.parse(get_arr(opts)[next]);
  }
  function clear(opts) {
    if (has_browser_storage(opts)) clear_browser_store(opts);
    dict_cache = {};
  } // zoom - store translation coords

  function setposition(opts, x, y, zoom) {
    if (has_browser_storage(opts)) {
      var store = opts.store_type === 'local' ? localStorage : sessionStorage;

      if (x) {
        set_browser_store(opts, get_prefix(opts) + '_X', x);
        set_browser_store(opts, get_prefix(opts) + '_Y', y);
      } else {
        store.removeItem(get_prefix(opts) + '_X');
        store.removeItem(get_prefix(opts) + '_Y');
      }

      var zoomName = get_prefix(opts) + '_ZOOM';
      if (zoom) set_browser_store(opts, zoomName, zoom);else store.removeItem(zoomName);
    }
  }
  function getposition(opts) {
    if (!has_browser_storage(opts) || localStorage.getItem(get_prefix(opts) + '_X') === null && sessionStorage.getItem(get_prefix(opts) + '_X') === null) return [null, null];
    var pos = [parseInt(get_browser_store(opts, get_prefix(opts) + '_X')), parseInt(get_browser_store(opts, get_prefix(opts) + '_Y'))];
    if (get_browser_store(opts, get_prefix(opts) + '_ZOOM') !== null) pos.push(parseFloat(get_browser_store(opts, get_prefix(opts) + '_ZOOM')));
    return pos;
  }

  var pedcache = /*#__PURE__*/Object.freeze({
    __proto__: null,
    clear_pedigree_data: clear_pedigree_data,
    get_count: get_count,
    init_cache: init_cache,
    nstore: nstore,
    current: current,
    last: last,
    previous: previous,
    next: next,
    clear: clear,
    setposition: setposition,
    getposition: getposition
  });

  function isIE() {
    var ua = navigator.userAgent;
    /* MSIE used to detect old browsers and Trident used to newer ones*/

    return ua.indexOf("MSIE ") > -1 || ua.indexOf("Trident/") > -1;
  }
  function isEdge() {
    return navigator.userAgent.match(/Edge/g);
  }
  function copy_dataset(dataset) {
    if (dataset[0].id) {
      // sort by id
      dataset.sort(function (a, b) {
        return !a.id || !b.id ? 0 : a.id > b.id ? 1 : b.id > a.id ? -1 : 0;
      });
    }

    var disallowed = ["id", "parent_node"];
    var newdataset = [];

    for (var i = 0; i < dataset.length; i++) {
      var obj = {};

      for (var key in dataset[i]) {
        if (disallowed.indexOf(key) == -1) obj[key] = dataset[i][key];
      }

      newdataset.push(obj);
    }

    return newdataset;
  } // check if the object contains a key with a given prefix

  function prefixInObj(prefix, obj) {
    var found = false;
    if (obj) $.each(obj, function (k, _n) {
      if (k.indexOf(prefix + "_") === 0 || k === prefix) {
        found = true;
        return found;
      }
    });
    return found;
  }
  /**
   *  Get formatted time or data & time
   */

  function getFormattedDate(time) {
    var d = new Date();
    if (time) return ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2);else return d.getFullYear() + "-" + ('0' + (d.getMonth() + 1)).slice(-2) + "-" + ('0' + d.getDate()).slice(-2) + " " + ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2);
  }
  /**
   * Show message or confirmation dialog.
   * @param title	 - dialog window title
   * @param msg	   - message to diasplay
   * @param onConfirm - function to call in a confirmation dialog
   * @param opts	  - pedigreejs options
   * @param dataset	- pedigree dataset
   */

  function messages(title, msg, onConfirm, opts, dataset) {
    if (onConfirm) {
      $('<div id="msgDialog">' + msg + '</div>').dialog({
        modal: true,
        title: title,
        width: 350,
        buttons: {
          "Yes": function Yes() {
            $(this).dialog('close');
            onConfirm(opts, dataset);
          },
          "No": function No() {
            $(this).dialog('close');
          }
        }
      });
    } else {
      $('<div id="msgDialog">' + msg + '</div>').dialog({
        title: title,
        width: 350,
        buttons: [{
          text: "OK",
          click: function click() {
            $(this).dialog("close");
          }
        }]
      });
    }
  }
  /**
   * Validate age and yob is consistent with current year. The sum of age and
   * yob should not be greater than or equal to current year. If alive the
   * absolute difference between the sum of age and year of birth and the
   * current year should be <= 1.
   * @param age	- age in years.
   * @param yob	- year of birth.
   * @param status - 0 = alive, 1 = dead.
   * @return true if age and yob are consistent with current year otherwise false.
   */

  function validate_age_yob(age, yob, status) {
    var year = new Date().getFullYear();
    var sum = parseInt(age) + parseInt(yob);

    if (status == 1) {
      // deceased
      return year >= sum;
    }

    return Math.abs(year - sum) <= 1 && year >= sum;
  }
  function capitaliseFirstLetter$1(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  function makeid(len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for (var i = 0; i < len; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  }
  function buildTree(opts, person, root, partnerLinks, id) {
    if (_typeof(person.children) === ("undefined" )) person.children = getChildren(opts.dataset, person);

    if (_typeof(partnerLinks) === ("undefined" )) {
      partnerLinks = [];
      id = 1;
    }

    var nodes = flatten(root); //console.log('NAME='+person.name+' NO. CHILDREN='+person.children.length);

    var partners = [];
    $.each(person.children, function (_i, child) {
      $.each(opts.dataset, function (_j, p) {
        if ((child.name === p.mother || child.name === p.father) && child.id === undefined) {
          var m = getNodeByName(nodes, p.mother);
          var f = getNodeByName(nodes, p.father);
          m = m !== undefined ? m : getNodeByName(opts.dataset, p.mother);
          f = f !== undefined ? f : getNodeByName(opts.dataset, p.father);
          if (!contains_parent(partners, m, f)) partners.push({
            'mother': m,
            'father': f
          });
        }
      });
    });
    $.merge(partnerLinks, partners);
    $.each(partners, function (_i, ptr) {
      var mother = ptr.mother;
      var father = ptr.father;
      mother.children = [];
      var parent = {
        name: makeid(4),
        hidden: true,
        parent: null,
        father: father,
        mother: mother,
        children: getChildren(opts.dataset, mother, father)
      };
      var midx = getIdxByName(opts.dataset, mother.name);
      var fidx = getIdxByName(opts.dataset, father.name);
      if (!('id' in father) && !('id' in mother)) id = setChildrenId(person.children, id); // look at grandparents index

      var gp = get_grandparents_idx(opts.dataset, midx, fidx);

      if (gp.fidx < gp.midx) {
        father.id = id++;
        parent.id = id++;
        mother.id = id++;
      } else {
        mother.id = id++;
        parent.id = id++;
        father.id = id++;
      }

      id = updateParent(mother, parent, id, nodes, opts);
      id = updateParent(father, parent, id, nodes, opts);
      person.children.push(parent);
    });
    id = setChildrenId(person.children, id);
    $.each(person.children, function (_i, p) {
      id = buildTree(opts, p, root, partnerLinks, id)[1];
    });
    return [partnerLinks, id];
  } // update parent node and sort twins

  function updateParent(p, parent, id, nodes, opts) {
    // add to parent node
    if ('parent_node' in p) p.parent_node.push(parent);else p.parent_node = [parent]; // check twins lie next to each other

    if (p.mztwin || p.dztwins) {
      var twins = getTwins(opts.dataset, p);

      for (var i = 0; i < twins.length; i++) {
        var twin = getNodeByName(nodes, twins[i].name);
        if (twin) twin.id = id++;
      }
    }

    return id;
  }

  function setChildrenId(children, id) {
    // sort twins to lie next to each other
    children.sort(function (a, b) {
      if (a.mztwin && b.mztwin && a.mztwin == b.mztwin) return 0;else if (a.dztwin && b.dztwin && a.dztwin == b.dztwin) return 0;else if (a.mztwin || b.mztwin || a.dztwin || b.dztwin) return 1;
      return 0;
    });
    $.each(children, function (_i, p) {
      if (p.id === undefined) p.id = id++;
    });
    return id;
  }

  function isProband(obj) {
    return _typeof($(obj).attr('proband')) !== ("undefined" ) && $(obj).attr('proband') !== false;
  }
  function setProband(dataset, name, is_proband) {
    $.each(dataset, function (_i, p) {
      if (name === p.name) p.proband = is_proband;else delete p.proband;
    });
  } //combine arrays ignoring duplicates

  function combineArrays(arr1, arr2) {
    for (var i = 0; i < arr2.length; i++) {
      if ($.inArray(arr2[i], arr1) == -1) arr1.push(arr2[i]);
    }
  }

  function include_children(connected, p, dataset) {
    if ($.inArray(p.name, connected) == -1) return;
    combineArrays(connected, get_partners(dataset, p));
    var children = getAllChildren(dataset, p);
    $.each(children, function (_child_idx, child) {
      if ($.inArray(child.name, connected) == -1) {
        connected.push(child.name);
        combineArrays(connected, get_partners(dataset, child));
      }
    });
  } //get the partners for a given node


  function get_partners(dataset, anode) {
    var ptrs = [];

    for (var i = 0; i < dataset.length; i++) {
      var bnode = dataset[i];
      if (anode.name === bnode.mother && $.inArray(bnode.father, ptrs) == -1) ptrs.push(bnode.father);else if (anode.name === bnode.father && $.inArray(bnode.mother, ptrs) == -1) ptrs.push(bnode.mother);
    }

    return ptrs;
  } //return a list of individuals that aren't connected to the target

  function unconnected(dataset) {
    var target = dataset[getProbandIndex(dataset)];

    if (!target) {
      console.warn("No target defined");

      if (dataset.length == 0) {
        throw "empty pedigree data set";
      }

      target = dataset[0];
    }

    var connected = [target.name];
    var change = true;
    var ii = 0;

    while (change && ii < 200) {
      ii++;
      var nconnect = connected.length;
      $.each(dataset, function (_idx, p) {
        if ($.inArray(p.name, connected) != -1) {
          // check if this person or a partner has a parent
          var ptrs = get_partners(dataset, p);
          var has_parent = p.name === target.name || !p.noparents;

          for (var i = 0; i < ptrs.length; i++) {
            if (!getNodeByName(dataset, ptrs[i]).noparents) has_parent = true;
          }

          if (has_parent) {
            if (p.mother && $.inArray(p.mother, connected) == -1) connected.push(p.mother);
            if (p.father && $.inArray(p.father, connected) == -1) connected.push(p.father);
          }
        } else if (!p.noparents && (p.mother && $.inArray(p.mother, connected) != -1 || p.father && $.inArray(p.father, connected) != -1)) {
          connected.push(p.name);
        } // include any children


        include_children(connected, p, dataset);
      });
      change = nconnect != connected.length;
    }

    var names = $.map(dataset, function (val, _i) {
      return val.name;
    });
    return $.map(names, function (name, _i) {
      return $.inArray(name, connected) == -1 ? name : null;
    });
  }
  function getProbandIndex(dataset) {
    var proband;
    $.each(dataset, function (i, val) {
      if (isProband(val)) {
        proband = i;
        return proband;
      }
    });
    return proband;
  }
  function getChildren(dataset, mother, father) {
    var children = [];
    var names = [];
    if (mother.sex === 'F') $.each(dataset, function (_i, p) {
      if (mother.name === p.mother) if (!father || father.name == p.father) {
        if ($.inArray(p.name, names) === -1) {
          children.push(p);
          names.push(p.name);
        }
      }
    });
    return children;
  }

  function contains_parent(arr, m, f) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].mother === m && arr[i].father === f) return true;
    }

    return false;
  } // get the siblings of a given individual - sex is an optional parameter
  // for only returning brothers or sisters


  function getSiblings(dataset, person, sex) {
    if (person === undefined || !person.mother || person.noparents) return [];
    return $.map(dataset, function (p, _i) {
      return p.name !== person.name && !('noparents' in p) && p.mother && p.mother === person.mother && p.father === person.father && (!sex || p.sex == sex) ? p : null;
    });
  } // get the siblings + adopted siblings

  function getAllSiblings(dataset, person, sex) {
    return $.map(dataset, function (p, _i) {
      return p.name !== person.name && !('noparents' in p) && p.mother && p.mother === person.mother && p.father === person.father && (!sex || p.sex == sex) ? p : null;
    });
  } // get the mono/di-zygotic twin(s)

  function getTwins(dataset, person) {
    var sibs = getSiblings(dataset, person);
    var twin_type = person.mztwin ? "mztwin" : "dztwin";
    return $.map(sibs, function (p, _i) {
      return p.name !== person.name && p[twin_type] == person[twin_type] ? p : null;
    });
  } // get the adopted siblings of a given individual

  function getAdoptedSiblings(dataset, person) {
    return $.map(dataset, function (p, _i) {
      return p.name !== person.name && 'noparents' in p && p.mother === person.mother && p.father === person.father ? p : null;
    });
  }
  function getAllChildren(dataset, person, sex) {
    return $.map(dataset, function (p, _i) {
      return !('noparents' in p) && (p.mother === person.name || p.father === person.name) && (!sex || p.sex === sex) ? p : null;
    });
  } // get the depth of the given person from the root

  function getDepth(dataset, name) {
    var idx = getIdxByName(dataset, name);
    var depth = 1;

    while (idx >= 0 && ('mother' in dataset[idx] || dataset[idx].top_level)) {
      idx = getIdxByName(dataset, dataset[idx].mother);
      depth++;
    }

    return depth;
  } // given an array of people get an index for a given person

  function getIdxByName(arr, name) {
    var idx = -1;
    $.each(arr, function (i, p) {
      if (name === p.name) {
        idx = i;
        return idx;
      }
    });
    return idx;
  } // get the nodes at a given depth sorted by their x position

  function getNodesAtDepth(fnodes, depth, exclude_names) {
    return $.map(fnodes, function (p, _i) {
      return p.depth == depth && !p.data.hidden && $.inArray(p.data.name, exclude_names) == -1 ? p : null;
    }).sort(function (a, b) {
      return a.x - b.x;
    });
  } // convert the partner names into corresponding tree nodes

  function linkNodes(flattenNodes, partners) {
    var links = [];

    for (var i = 0; i < partners.length; i++) {
      links.push({
        'mother': getNodeByName(flattenNodes, partners[i].mother.name),
        'father': getNodeByName(flattenNodes, partners[i].father.name)
      });
    }

    return links;
  } // get ancestors of a node

  function ancestors(dataset, node) {
    var ancestors = [];

    function recurse(node) {
      if (node.data) node = node.data;

      if ('mother' in node && 'father' in node && !('noparents' in node)) {
        recurse(getNodeByName(dataset, node.mother));
        recurse(getNodeByName(dataset, node.father));
      }

      ancestors.push(node);
    }

    recurse(node);
    return ancestors;
  } // test if two nodes are consanguinous partners

  function consanguity(node1, node2, opts) {
    if (node1.depth !== node2.depth) // parents at different depths
      return true;
    var ancestors1 = ancestors(opts.dataset, node1);
    var ancestors2 = ancestors(opts.dataset, node2);
    var names1 = $.map(ancestors1, function (ancestor, _i) {
      return ancestor.name;
    });
    var names2 = $.map(ancestors2, function (ancestor, _i) {
      return ancestor.name;
    });
    var consanguity = false;
    $.each(names1, function (_index, name) {
      if ($.inArray(name, names2) !== -1) {
        consanguity = true;
        return false;
      }
    });
    return consanguity;
  } // return a flattened representation of the tree

  function flatten(root) {
    var flat = [];

    function recurse(node) {
      if (node.children) node.children.forEach(recurse);
      flat.push(node);
    }

    recurse(root);
    return flat;
  } // Adjust D3 layout positioning.
  // Position hidden parent node centring them between father and mother nodes. Remove kinks
  // from links - e.g. where there is a single child plus a hidden child

  function adjust_coords(opts, root, flattenNodes) {
    function recurse(node) {
      if (node.children) {
        node.children.forEach(recurse);

        if (node.data.father !== undefined) {
          // hidden nodes
          var father = getNodeByName(flattenNodes, node.data.father.name);
          var mother = getNodeByName(flattenNodes, node.data.mother.name);
          var xmid = (father.x + mother.x) / 2;

          if (!overlap(opts, root.descendants(), xmid, node.depth, [node.data.name])) {
            node.x = xmid; // centralise parent nodes

            var diff = node.x - xmid;

            if (node.children.length == 2 && (node.children[0].data.hidden || node.children[1].data.hidden)) {
              if (!(node.children[0].data.hidden && node.children[1].data.hidden)) {
                var child1 = node.children[0].data.hidden ? node.children[1] : node.children[0];
                var child2 = node.children[0].data.hidden ? node.children[0] : node.children[1];

                if ((child1.x < child2.x && xmid < child2.x || child1.x > child2.x && xmid > child2.x) && !overlap(opts, root.descendants(), xmid, child1.depth, [child1.data.name])) {
                  child1.x = xmid;
                }
              }
            } else if (node.children.length == 1 && !node.children[0].data.hidden) {
              if (!overlap(opts, root.descendants(), xmid, node.children[0].depth, [node.children[0].data.name])) node.children[0].x = xmid;
            } else {
              if (diff !== 0 && !nodesOverlap(opts, node, diff, root)) {
                if (node.children.length == 1) {
                  node.children[0].x = xmid;
                } else {
                  var descendants = node.descendants();
                  if (opts.DEBUG) console.log('ADJUSTING ' + node.data.name + ' NO. DESCENDANTS ' + descendants.length + ' diff=' + diff);

                  for (var i = 0; i < descendants.length; i++) {
                    if (node.data.name !== descendants[i].data.name) descendants[i].x -= diff;
                  }
                }
              }
            }
          } else if (node.x < father.x && node.x < mother.x || node.x > father.x && node.x > mother.x) {
            node.x = xmid; // centralise parent nodes if it doesn't lie between mother and father
          }
        }
      }
    }

    recurse(root);
    recurse(root);
  } // test if moving siblings by diff overlaps with other nodes

  function nodesOverlap(opts, node, diff, root) {
    var descendants = node.descendants();
    var descendantsNames = $.map(descendants, function (descendant, _i) {
      return descendant.data.name;
    });
    var nodes = root.descendants();

    for (var i = 0; i < descendants.length; i++) {
      var descendant = descendants[i];

      if (node.data.name !== descendant.data.name) {
        var xnew = descendant.x - diff;
        if (overlap(opts, nodes, xnew, descendant.depth, descendantsNames)) return true;
      }
    }

    return false;
  } // test if x position overlaps a node at the same depth


  function overlap(opts, nodes, xnew, depth, exclude_names) {
    for (var n = 0; n < nodes.length; n++) {
      if (depth == nodes[n].depth && $.inArray(nodes[n].data.name, exclude_names) == -1) {
        if (Math.abs(xnew - nodes[n].x) < opts.symbol_size * 1.15) return true;
      }
    }

    return false;
  } // given a persons name return the corresponding d3 tree node

  function getNodeByName(nodes, name) {
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].data && name === nodes[i].data.name) return nodes[i];else if (name === nodes[i].name) return nodes[i];
    }
  } // given the name of a url param get the value

  function urlParam(name) {
    var results = new RegExp('[?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results === null) return null;else return results[1] || 0;
  } // get grandparents index

  function get_grandparents_idx(dataset, midx, fidx) {
    var gmidx = midx;
    var gfidx = fidx;

    while ('mother' in dataset[gmidx] && 'mother' in dataset[gfidx] && !('noparents' in dataset[gmidx]) && !('noparents' in dataset[gfidx])) {
      gmidx = getIdxByName(dataset, dataset[gmidx].mother);
      gfidx = getIdxByName(dataset, dataset[gfidx].mother);
    }

    return {
      'midx': gmidx,
      'fidx': gfidx
    };
  } // Set or remove proband attributes.
  // If a value is not provided the attribute is removed from the proband.
  // 'key' can be a list of keys or a single key.


  function proband_attr(opts, keys, value) {
    var proband = opts.dataset[getProbandIndex(opts.dataset)];
    node_attr(opts, proband.name, keys, value);
  } // Set or remove node attributes.
  // If a value is not provided the attribute is removed.
  // 'key' can be a list of keys or a single key.

  function node_attr(opts, name, keys, value) {
    var newdataset = copy_dataset(current(opts));
    var node = getNodeByName(newdataset, name);

    if (!node) {
      console.warn("No person defined");
      return;
    }

    if (!$.isArray(keys)) {
      keys = [keys];
    }

    if (value) {
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i]; //console.log('VALUE PROVIDED', k, value, (k in node));

        if (k in node && keys.length === 1) {
          if (node[k] === value) return;

          try {
            if (JSON.stringify(node[k]) === JSON.stringify(value)) return;
          } catch (e) {// continue regardless of error
          }
        }

        node[k] = value;
      }
    } else {
      var found = false;

      for (var _i2 = 0; _i2 < keys.length; _i2++) {
        var _k = keys[_i2]; //console.log('NO VALUE PROVIDED', k, (k in node));

        if (_k in node) {
          delete node[_k];
          found = true;
        }
      }

      if (!found) return;
    }

    syncTwins(newdataset, node);
    opts.dataset = newdataset;
    rebuild(opts);
  } // add a child to the proband; giveb sex, age, yob and breastfeeding months (optional)

  function proband_add_child(opts, sex, age, yob, breastfeeding) {
    var newdataset = copy_dataset(current(opts));
    var proband = newdataset[getProbandIndex(newdataset)];

    if (!proband) {
      console.warn("No proband defined");
      return;
    }

    var newchild = addchild(newdataset, proband, sex, 1)[0];
    newchild.age = age;
    newchild.yob = yob;
    if (breastfeeding !== undefined) newchild.breastfeeding = breastfeeding;
    opts.dataset = newdataset;
    rebuild(opts);
    return newchild.name;
  } // delete node using the name

  function delete_node_by_name(opts, name) {
    function onDone(opts, dataset) {
      // assign new dataset and rebuild pedigree
      opts.dataset = dataset;
      rebuild(opts);
    }

    var newdataset = copy_dataset(current(opts));
    var node = getNodeByName(current(opts), name);

    if (!node) {
      console.warn("No node defined");
      return;
    }

    delete_node_dataset(newdataset, node, opts, onDone);
  } // check by name if the individual exists

  function exists(opts, name) {
    return getNodeByName(current(opts), name) !== undefined;
  } // print options and dataset

  function print_opts(opts) {
    $("#pedigree_data").remove();
    $("body").append("<div id='pedigree_data'></div>");
    var key;

    for (var i = 0; i < opts.dataset.length; i++) {
      var person = "<div class='row'><strong class='col-md-1 text-right'>" + opts.dataset[i].name + "</strong><div class='col-md-11'>";

      for (key in opts.dataset[i]) {
        if (key === 'name') continue;
        if (key === 'parent') person += "<span>" + key + ":" + opts.dataset[i][key].name + "; </span>";else if (key === 'children') {
          if (opts.dataset[i][key][0] !== undefined) person += "<span>" + key + ":" + opts.dataset[i][key][0].name + "; </span>";
        } else person += "<span>" + key + ":" + opts.dataset[i][key] + "; </span>";
      }

      $("#pedigree_data").append(person + "</div></div>");
    }

    $("#pedigree_data").append("<br /><br />");

    for (key in opts) {
      if (key === 'dataset') continue;
      $("#pedigree_data").append("<span>" + key + ":" + opts[key] + "; </span>");
    }
  }

  var pedigree_utils = /*#__PURE__*/Object.freeze({
    __proto__: null,
    isIE: isIE,
    isEdge: isEdge,
    copy_dataset: copy_dataset,
    prefixInObj: prefixInObj,
    getFormattedDate: getFormattedDate,
    messages: messages,
    validate_age_yob: validate_age_yob,
    capitaliseFirstLetter: capitaliseFirstLetter$1,
    makeid: makeid,
    buildTree: buildTree,
    isProband: isProband,
    setProband: setProband,
    get_partners: get_partners,
    unconnected: unconnected,
    getProbandIndex: getProbandIndex,
    getChildren: getChildren,
    getSiblings: getSiblings,
    getAllSiblings: getAllSiblings,
    getTwins: getTwins,
    getAdoptedSiblings: getAdoptedSiblings,
    getAllChildren: getAllChildren,
    getDepth: getDepth,
    getIdxByName: getIdxByName,
    getNodesAtDepth: getNodesAtDepth,
    linkNodes: linkNodes,
    ancestors: ancestors,
    consanguity: consanguity,
    flatten: flatten,
    adjust_coords: adjust_coords,
    overlap: overlap,
    getNodeByName: getNodeByName,
    urlParam: urlParam,
    proband_attr: proband_attr,
    node_attr: node_attr,
    proband_add_child: proband_add_child,
    delete_node_by_name: delete_node_by_name,
    exists: exists,
    print_opts: print_opts
  });

  var zoom; // initialise zoom and drag

  function init_zoom(opts, svg) {
    // offsets
    var xi = opts.symbol_size / 2;
    var yi = -opts.symbol_size * 2.5;
    zoom = d3.zoom().scaleExtent([opts.zoomIn, opts.zoomOut]).filter(function () {
      if (!opts.zoomSrc || opts.zoomSrc.indexOf('wheel') === -1) {
        if (d3.event.type && d3.event.type === 'wheel') return false;
      } // ignore dblclick & secondary mouse buttons


      return d3.event.type !== 'dblclick' && !d3.event.button;
    }).on('zoom', function () {
      zooming(opts);
    });
    svg.call(zoom); // set initial position & scale

    var xyk = getposition(opts); // cached position

    var k = xyk.length == 3 ? xyk[2] : 1;
    var x = xyk[0] !== null ? xyk[0] / k : xi * k;
    var y = xyk[1] !== null ? xyk[1] / k : yi * k;
    var transform = d3.zoomIdentity.scale(k).translate(x, y);
    svg.call(zoom.transform, transform);
  } // scale size the pedigree

  function btn_zoom(opts, scale) {
    var svg = d3.select("#" + opts.targetDiv).select("svg");
    svg.transition().duration(50).call(zoom.scaleBy, scale);
  }
  function scale_to_fit(opts) {
    var d = get_dimensions(opts);
    var svg = d3.select("#" + opts.targetDiv).select("svg");
    var size = get_svg_size(svg);
    var f = (size.w - opts.symbol_size * 2) / size.w;
    var k = f / Math.max(d.wid / size.w, d.hgt / size.h);
    if (k < opts.zoomIn) zoom.scaleExtent([k, opts.zoomOut]);
    var ped = get_pedigree_center(opts);
    svg.call(zoom.translateTo, ped.x, ped.y);
    setTimeout(function () {
      svg.transition().duration(700).call(zoom.scaleTo, k);
    }, 400);
  }

  function zooming(opts) {
    opts.DEBUG && console.log("zoom", d3.event, d3.event.transform);
    var t = d3.event.transform;
    var k = t.k && t.k !== 1 ? t.k : undefined;
    setposition(opts, t.x, t.y, k);
    var ped = d3.select("#" + opts.targetDiv).select(".diagram");
    ped.attr('transform', 'translate(' + t.x + ',' + t.y + ')' + (k ? ' scale(' + k + ')' : ''));
  }

  function get_pedigree_center(opts) {
    var b = get_bounds(opts);
    return {
      x: b.xmin + (b.xmax - b.xmin) / 2,
      y: b.ymin + (b.ymax - b.ymin) / 2
    };
  } // find width/height of pedigree graphic


  function get_dimensions(opts) {
    var b = get_bounds(opts);
    return {
      wid: Math.abs(b.xmax - b.xmin),
      hgt: Math.abs(b.ymax - b.ymin)
    };
  }

  function get_bounds(opts) {
    var ped = d3.select("#" + opts.targetDiv).select(".diagram");
    var xmin = Number.MAX_VALUE;
    var xmax = -1000000;
    var ymin = Number.MAX_VALUE;
    var ymax = -1000000;
    var sym2 = opts.symbol_size / 2;
    ped.selectAll('g').each(function (d, _i) {
      if (d.x && d.data.name !== 'hidden_root') {
        if (d.x - sym2 < xmin) xmin = d.x - sym2;
        if (d.x + sym2 > xmax) xmax = d.x + sym2;
        if (d.y - sym2 < ymin) ymin = d.y - sym2;
        if (d.y + sym2 > ymax) ymax = d.y + sym2;
      }
    });
    return {
      xmin: xmin,
      xmax: xmax,
      ymin: ymin,
      ymax: ymax
    };
  }

  function get_svg_size(svg) {
    return {
      w: svg.node().clientWidth,
      h: svg.node().clientHeight
    };
  }

  // undo, redo, reset buttons
  function add$1(options) {
    var opts = $.extend({
      // defaults
      btn_target: 'pedigree_history'
    }, options);
    var btns = [{
      "fa": "fa-undo pull-left",
      "title": "undo"
    }, {
      "fa": "fa-repeat pull-left",
      "title": "redo"
    }, {
      "fa": "fa-refresh pull-left",
      "title": "reset"
    }];
    btns.push({
      "fa": "fa-crosshairs pull-right",
      "title": "scale-to-fit"
    });

    if (opts.zoomSrc && opts.zoomSrc.indexOf('button') > -1) {
      if (opts.zoomOut != 1) btns.push({
        "fa": "fa-minus-circle pull-right",
        "title": "zoom-out"
      });
      if (opts.zoomIn != 1) btns.push({
        "fa": "fa-plus-circle pull-right",
        "title": "zoom-in"
      });
    }

    btns.push({
      "fa": "fa-arrows-alt pull-right",
      "title": "fullscreen"
    });
    var lis = "";

    for (var i = 0; i < btns.length; i++) {
      lis += '<span>';
      lis += '&nbsp;<i class="fa fa-lg ' + btns[i].fa + '" ' + (btns[i].fa == "fa-arrows-alt pull-right" ? 'id="fullscreen" ' : '') + ' aria-hidden="true" title="' + btns[i].title + '"></i>';
      lis += '</span>';
    }

    $("#" + opts.btn_target).append(lis);
    click(opts);
  }
  function is_fullscreen() {
    return document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
  }

  function click(opts) {
    // fullscreen
    $(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange', function (_e) {
      var local_dataset = current(opts);

      if (local_dataset !== undefined && local_dataset !== null) {
        opts.dataset = local_dataset;
      }

      rebuild(opts);
      setTimeout(function () {
        scale_to_fit(opts);
      }, 500);
    });
    $('#fullscreen').on('click', function (_e) {
      // toggle fullscreen
      if (!is_fullscreen()) {
        var target = $("#" + opts.targetDiv)[0];

        if (target.requestFullscreen) {
          target.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
          target.mozRequestFullScreen(); // Firefox
        } else if (document.documentElement.webkitRequestFullscreen) {
          target.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT); // Chrome and Safari
        } else if (document.documentElement.msRequestFullscreen) {
          target.msRequestFullscreen(); // IE
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    }); // press and hold to zoom in/out

    var timeoutId = 0;

    function zoomIn() {
      btn_zoom(opts, 1.05);
    }

    function zoomOut() {
      btn_zoom(opts, 0.95);
    }

    $('.fa-plus-circle, .fa-minus-circle').on('mousedown', function () {
      timeoutId = setInterval($(this).hasClass("fa-plus-circle") ? zoomIn : zoomOut, 50);
    }).on('mouseup mouseleave', function () {
      clearInterval(timeoutId);
    }); // undo/redo/reset

    $("#" + opts.btn_target).on("click", function (e) {
      e.stopPropagation();
      if ($(e.target).hasClass("disabled")) return false;

      if ($(e.target).hasClass('fa-undo')) {
        opts.dataset = previous(opts);
        $("#" + opts.targetDiv).empty();
        build(opts);
      } else if ($(e.target).hasClass('fa-repeat')) {
        opts.dataset = next(opts);
        $("#" + opts.targetDiv).empty();
        build(opts);
      } else if ($(e.target).hasClass('fa-refresh')) {
        $('<div id="msgDialog">Resetting the pedigree may result in loss of some data.</div>').dialog({
          title: 'Confirm Reset',
          resizable: false,
          height: "auto",
          width: 400,
          modal: true,
          buttons: {
            Continue: function Continue() {
              reset(opts, opts.keep_proband_on_reset);
              $(this).dialog("close");
            },
            Cancel: function Cancel() {
              $(this).dialog("close");
              return;
            }
          }
        });
      } else if ($(e.target).hasClass('fa-crosshairs')) {
        scale_to_fit(opts);
      } // trigger fhChange event


      $(document).trigger('fhChange', [opts]);
    });
  } // reset pedigree and clear the history


  function reset(opts, keep_proband) {
    var proband;

    if (keep_proband) {
      var local_dataset = current(opts);
      var newdataset = copy_dataset(local_dataset);
      proband = newdataset[getProbandIndex(newdataset)]; //let children = pedigree_util.getChildren(newdataset, proband);

      proband.name = "ch1";
      proband.mother = "f21";
      proband.father = "m21"; // clear pedigree data but keep proband data and risk factors

      clear_pedigree_data(opts);
    } else {
      proband = {
        "name": "ch1",
        "sex": "F",
        "mother": "f21",
        "father": "m21",
        "proband": true,
        "status": "0",
        "display_name": "me"
      };
      clear(opts); // clear all storage data
    }

    delete opts.dataset;
    var selected = $("input[name='default_fam']:checked");

    if (selected.length > 0 && selected.val() == 'extended2') {
      // secondary relatives
      opts.dataset = [{
        "name": "wZA",
        "sex": "M",
        "top_level": true,
        "status": "0",
        "display_name": "paternal grandfather"
      }, {
        "name": "MAk",
        "sex": "F",
        "top_level": true,
        "status": "0",
        "display_name": "paternal grandmother"
      }, {
        "name": "zwB",
        "sex": "M",
        "top_level": true,
        "status": "0",
        "display_name": "maternal grandfather"
      }, {
        "name": "dOH",
        "sex": "F",
        "top_level": true,
        "status": "0",
        "display_name": "maternal grandmother"
      }, {
        "name": "MKg",
        "sex": "F",
        "mother": "MAk",
        "father": "wZA",
        "status": "0",
        "display_name": "paternal aunt"
      }, {
        "name": "xsm",
        "sex": "M",
        "mother": "MAk",
        "father": "wZA",
        "status": "0",
        "display_name": "paternal uncle"
      }, {
        "name": "m21",
        "sex": "M",
        "mother": "MAk",
        "father": "wZA",
        "status": "0",
        "display_name": "father"
      }, {
        "name": "f21",
        "sex": "F",
        "mother": "dOH",
        "father": "zwB",
        "status": "0",
        "display_name": "mother"
      }, {
        "name": "aOH",
        "sex": "F",
        "mother": "f21",
        "father": "m21",
        "status": "0",
        "display_name": "sister"
      }, {
        "name": "Vha",
        "sex": "M",
        "mother": "f21",
        "father": "m21",
        "status": "0",
        "display_name": "brother"
      }, {
        "name": "Spj",
        "sex": "M",
        "mother": "f21",
        "father": "m21",
        "noparents": true,
        "status": "0",
        "display_name": "partner"
      }, proband, {
        "name": "zhk",
        "sex": "F",
        "mother": "ch1",
        "father": "Spj",
        "status": "0",
        "display_name": "daughter"
      }, {
        "name": "Knx",
        "display_name": "son",
        "sex": "M",
        "mother": "ch1",
        "father": "Spj",
        "status": "0"
      }, {
        "name": "uuc",
        "display_name": "maternal aunt",
        "sex": "F",
        "mother": "dOH",
        "father": "zwB",
        "status": "0"
      }, {
        "name": "xIw",
        "display_name": "maternal uncle",
        "sex": "M",
        "mother": "dOH",
        "father": "zwB",
        "status": "0"
      }];
    } else if (selected.length > 0 && selected.val() == 'extended1') {
      // primary relatives
      opts.dataset = [{
        "name": "m21",
        "sex": "M",
        "mother": null,
        "father": null,
        "status": "0",
        "display_name": "father",
        "noparents": true
      }, {
        "name": "f21",
        "sex": "F",
        "mother": null,
        "father": null,
        "status": "0",
        "display_name": "mother",
        "noparents": true
      }, {
        "name": "aOH",
        "sex": "F",
        "mother": "f21",
        "father": "m21",
        "status": "0",
        "display_name": "sister"
      }, {
        "name": "Vha",
        "sex": "M",
        "mother": "f21",
        "father": "m21",
        "status": "0",
        "display_name": "brother"
      }, {
        "name": "Spj",
        "sex": "M",
        "mother": "f21",
        "father": "m21",
        "noparents": true,
        "status": "0",
        "display_name": "partner"
      }, proband, {
        "name": "zhk",
        "sex": "F",
        "mother": "ch1",
        "father": "Spj",
        "status": "0",
        "display_name": "daughter"
      }, {
        "name": "Knx",
        "display_name": "son",
        "sex": "M",
        "mother": "ch1",
        "father": "Spj",
        "status": "0"
      }];
    } else {
      opts.dataset = [{
        "name": "m21",
        "display_name": "father",
        "sex": "M",
        "top_level": true
      }, {
        "name": "f21",
        "display_name": "mother",
        "sex": "F",
        "top_level": true
      }, proband];
    }

    rebuild(opts);
  }
  function updateButtons(opts) {
    var current = get_count(opts);
    var nstore$1 = nstore(opts);
    var id = "#" + opts.btn_target;
    if (nstore$1 <= current) $(id + " .fa-repeat").addClass('disabled');else $(id + " .fa-repeat").removeClass('disabled');
    if (current > 1) $(id + " .fa-undo").removeClass('disabled');else $(id + " .fa-undo").addClass('disabled');
  }

  var cancers = {
    'breast_cancer': 'breast_cancer_diagnosis_age',
    'breast_cancer2': 'breast_cancer2_diagnosis_age',
    'ovarian_cancer': 'ovarian_cancer_diagnosis_age',
    'prostate_cancer': 'prostate_cancer_diagnosis_age',
    'pancreatic_cancer': 'pancreatic_cancer_diagnosis_age'
  };
  var genetic_test = ['brca1', 'brca2', 'palb2', 'atm', 'chek2', 'rad51d', 'rad51c', 'brip1'];
  var pathology_tests = ['er', 'pr', 'her2', 'ck14', 'ck56']; // risk factor to storage

  var RISK_FACTOR_STORE = new Object(); // get surgical ops and PRS for canrisk header

  function get_meta() {
    var meta = get_surgical_ops();
    var prs;

    try {
      prs = get_prs_values();

      if (prs.breast_cancer_prs && prs.breast_cancer_prs.alpha !== 0 && prs.breast_cancer_prs.zscore !== 0) {
        meta += "\n##PRS_BC=alpha=" + prs.breast_cancer_prs.alpha + ",zscore=" + prs.breast_cancer_prs.zscore;
      }

      if (prs.ovarian_cancer_prs && prs.ovarian_cancer_prs.alpha !== 0 && prs.ovarian_cancer_prs.zscore !== 0) {
        meta += "\n##PRS_OC=alpha=" + prs.ovarian_cancer_prs.alpha + ",zscore=" + prs.ovarian_cancer_prs.zscore;
      }
    } catch (err) {
      console.warn("PRS", prs);
    }

    return meta;
  } // return a non-anonimised pedigree format

  function get_non_anon_pedigree(dataset, meta) {
    return get_pedigree(dataset, undefined, meta, false);
  } //check if input has a value

  function hasInput(id) {
    return $.trim($('#' + id).val()).length !== 0;
  } //return true if the object is empty

  var isEmpty = function isEmpty(myObj) {
    for (var key in myObj) {
      if (Object.prototype.hasOwnProperty.call(myObj, key)) {
        return false;
      }
    }

    return true;
  }; //get breast and ovarian PRS values


  function get_prs_values() {
    var prs = {};

    if (hasInput("breast_prs_a") && hasInput("breast_prs_z")) {
      prs['breast_cancer_prs'] = {
        'alpha': parseFloat($('#breast_prs_a').val()),
        'zscore': parseFloat($('#breast_prs_z').val()),
        'percent': parseFloat($('#breast_prs_percent').val())
      };
    }

    if (hasInput("ovarian_prs_a") && hasInput("ovarian_prs_z")) {
      prs['ovarian_cancer_prs'] = {
        'alpha': parseFloat($('#ovarian_prs_a').val()),
        'zscore': parseFloat($('#ovarian_prs_z').val()),
        'percent': parseFloat($('#ovarian_prs_percent').val())
      };
    }

    console.log(prs);
    return isEmpty(prs) ? 0 : prs;
  }

  function get_surgical_ops() {
    var meta = "";

    if (!$('#A6_4_3_check').parent().hasClass("off")) {
      meta += ";OVARY2=y";
    }

    if (!$('#A6_4_7_check').parent().hasClass("off")) {
      meta += ";MAST2=y";
    }

    return meta;
  }

  function readCanRiskV1(boadicea_lines) {
    var lines = boadicea_lines.trim().split('\n');
    var ped = [];
    var hdr = []; // collect risk factor header lines
    // assumes two line header

    var _loop = function _loop(i) {
      var ln = lines[i].trim();

      if (ln.indexOf("##") === 0) {
        if (ln.indexOf("##CanRisk") === 0 && ln.indexOf(";") > -1) {
          // contains surgical op data
          var ops = ln.split(";");

          for (var j = 1; j < ops.length; j++) {
            var opdata = ops[j].split("=");

            if (opdata.length === 2) {
              hdr.push(ops[j]);
            }
          }
        }

        if (ln.indexOf("CanRisk") === -1 && ln.indexOf("##FamID") !== 0) {
          hdr.push(ln.replace("##", ""));
        }

        return "continue";
      }

      var delim = /\t/;

      if (ln.indexOf('\t') < 0) {
        delim = /\s+/;
        console.log("NOT TAB DELIM");
      }

      var attr = $.map(ln.split(delim), function (val, _i) {
        return val.trim();
      });

      if (attr.length > 1) {
        var indi = {
          'famid': attr[0],
          'display_name': attr[1],
          'name': attr[3],
          'sex': attr[6],
          'status': attr[8]
        };
        if (attr[2] == 1) indi.proband = true;
        if (attr[4] !== "0") indi.father = attr[4];
        if (attr[5] !== "0") indi.mother = attr[5];
        if (attr[7] !== "0") indi.mztwin = attr[7];
        if (attr[9] !== "0") indi.age = attr[9];
        if (attr[10] !== "0") indi.yob = attr[10];
        var idx = 11;
        $.each(cancers, function (cancer, diagnosis_age) {
          // Age at 1st cancer or 0 = unaffected, AU = unknown age at diagnosis (affected unknown)
          if (attr[idx] !== "0") {
            indi[diagnosis_age] = attr[idx];
          }

          idx++;
        });
        if (attr[idx++] !== "0") indi.ashkenazi = 1; // BRCA1, BRCA2, PALB2, ATM, CHEK2, .... genetic tests
        // genetic test type, 0 = untested, S = mutation search, T = direct gene test
        // genetic test result, 0 = untested, P = positive, N = negative

        for (var _j = 0; _j < genetic_test.length; _j++) {
          var gene_test = attr[idx].split(":");

          if (gene_test[0] !== '0') {
            if ((gene_test[0] === 'S' || gene_test[0] === 'T') && (gene_test[1] === 'P' || gene_test[1] === 'N')) indi[genetic_test[_j] + '_gene_test'] = {
              'type': gene_test[0],
              'result': gene_test[1]
            };else console.warn('UNRECOGNISED GENE TEST ON LINE ' + (i + 1) + ": " + gene_test[0] + " " + gene_test[1]);
          }

          idx++;
        } // status, 0 = unspecified, N = negative, P = positive


        var path_test = attr[idx].split(":");

        for (var _j2 = 0; _j2 < path_test.length; _j2++) {
          if (path_test[_j2] !== '0') {
            if (path_test[_j2] === 'N' || path_test[_j2] === 'P') indi[pathology_tests[_j2] + '_bc_pathology'] = path_test[_j2];else console.warn('UNRECOGNISED PATHOLOGY ON LINE ' + (i + 1) + ": " + pathology_tests[_j2] + " " + path_test[_j2]);
          }
        }

        ped.unshift(indi);
      }
    };

    for (var i = 0; i < lines.length; i++) {
      var _ret = _loop(i);

      if (_ret === "continue") continue;
    }

    return [hdr, ped];
  }
  /**
   * Get CanRisk formated pedigree.
   */

  function get_pedigree(dataset, famid, meta, isanon) {
    var msg = "##CanRisk 1.0";

    if (!famid) {
      famid = "XXXX";
    }

    if (meta) {
      msg += meta;
    }

    if (typeof isanon === 'undefined') {
      isanon = true;
    } // array of individuals excluded from the calculation


    var excl = $.map(dataset, function (p, _i) {
      return 'exclude' in p && p.exclude ? p.name : null;
    }); // female risk factors

    var probandIdx = getProbandIndex(dataset);
    var sex = 'F';

    if (probandIdx) {
      sex = dataset[probandIdx].sex;
    }

    if (sex !== 'M') {
      var menarche = get_risk_factor('menarche_age');
      var parity = get_risk_factor('parity');
      var first_birth = get_risk_factor('age_of_first_live_birth');
      var oc_use = get_risk_factor('oral_contraception');
      var mht_use = get_risk_factor('mht');
      var bmi = get_risk_factor('bmi');
      var alcohol = get_risk_factor('alcohol_intake');
      var menopause = get_risk_factor('age_of_menopause');
      var mdensity = get_risk_factor('mammographic_density');
      var hgt = get_risk_factor('height');
      var tl = get_risk_factor('Age_Tubal_ligation');
      var endo = get_risk_factor('endometriosis');
      if (menarche !== undefined) msg += "\n##menarche=" + menarche;
      if (parity !== undefined) msg += "\n##parity=" + parity;
      if (first_birth !== undefined) msg += "\n##first_live_birth=" + first_birth;
      if (oc_use !== undefined) msg += "\n##oc_use=" + oc_use;
      if (mht_use !== undefined) msg += "\n##mht_use=" + mht_use;
      if (bmi !== undefined) msg += "\n##BMI=" + bmi;
      if (alcohol !== undefined) msg += "\n##alcohol=" + alcohol;
      if (menopause !== undefined) msg += "\n##menopause=" + menopause;
      if (mdensity !== undefined) msg += "\n##birads=" + mdensity;
      if (hgt !== undefined) msg += "\n##height=" + hgt;
      if (tl !== undefined) if (tl !== "n" && tl !== "N") msg += "\n##TL=Y";else msg += "\n##TL=N";
      if (endo !== undefined) msg += "\n##endo=" + endo;
    }

    msg += "\n##FamID\tName\tTarget\tIndivID\tFathID\tMothID\tSex\tMZtwin\tDead\tAge\tYob\tBC1\tBC2\tOC\tPRO\tPAN\tAshkn\tBRCA1\tBRCA2\tPALB2\tATM\tCHEK2\tRAD51D\tRAD51C\tBRIP1\tER:PR:HER2:CK14:CK56";

    var _loop2 = function _loop2(i) {
      var p = dataset[i];

      if ($.inArray(p.name, excl) != -1) {
        console.log('EXCLUDE: ' + p.name);
        return "continue";
      }

      msg += '\n' + famid + '\t'; // max 13 chars

      if (isanon) msg += i + '\t'; // display_name (ANONIMISE) max 8 chars
      else msg += (p.display_name ? p.display_name : "NA") + '\t';
      msg += ('proband' in p ? '1' : 0) + '\t';
      msg += p.name + '\t'; // max 7 chars

      msg += ('father' in p && !('noparents' in p) && $.inArray(p.mother, excl) == -1 ? p.father : 0) + '\t'; // max 7 chars

      msg += ('mother' in p && !('noparents' in p) && $.inArray(p.mother, excl) == -1 ? p.mother : 0) + '\t'; // max 7 chars

      msg += p.sex + '\t';
      msg += ('mztwin' in p ? p.mztwin : 0) + '\t'; // MZtwin

      msg += ('status' in p ? p.status : 0) + '\t'; // current status: 0 = alive, 1 = dead

      msg += ('age' in p ? p.age : 0) + '\t'; // Age at last follow up or 0 = unspecified

      msg += ('yob' in p ? p.yob : 0) + '\t'; // YOB or 0 = unspecified

      $.each(cancers, function (cancer, diagnosis_age) {
        // Age at 1st cancer or 0 = unaffected, AU = unknown age at diagnosis (affected unknown)
        if (diagnosis_age in p) msg += (diagnosis_age in p ? p[diagnosis_age] : 'AU') + '\t';else msg += '0\t';
      }); // Ashkenazi status, 0 = not Ashkenazi, 1 = Ashkenazi

      msg += ('ashkenazi' in p ? p.ashkenazi : 0) + '\t';

      for (var j = 0; j < genetic_test.length; j++) {
        if (genetic_test[j] + '_gene_test' in p && p[genetic_test[j] + '_gene_test']['type'] !== '-' && p[genetic_test[j] + '_gene_test']['result'] !== '-') {
          msg += p[genetic_test[j] + '_gene_test']['type'] + ':';
          msg += p[genetic_test[j] + '_gene_test']['result'] + '\t';
        } else {
          msg += '0:0\t'; // type, 0=untested, S=mutation search, T=direct gene test
          // result, 0=untested, P=positive, N=negative
        }
      }

      for (var _j3 = 0; _j3 < pathology_tests.length; _j3++) {
        // status, 0 = unspecified, N = negative, P = positive
        if (pathology_tests[_j3] + '_bc_pathology' in p) {
          msg += p[pathology_tests[_j3] + '_bc_pathology'];
          console.log('pathology ' + p[pathology_tests[_j3] + '_bc_pathology'] + ' for ' + p.display_name);
        } else {
          msg += '0';
        }

        if (_j3 < pathology_tests.length - 1) msg += ":";
      }
    };

    for (var i = 0; i < dataset.length; i++) {
      var _ret2 = _loop2(i);

      if (_ret2 === "continue") continue;
    }

    console.log(msg, RISK_FACTOR_STORE);
    return msg;
  }
  function show_risk_factor_store() {
    console.log("RISK_FACTOR_STORE::");
    $.each(RISK_FACTOR_STORE, function (name, val) {
      console.log(name + " : " + val);
    });
  }
  function save_risk_factor(risk_factor_name, val) {
    RISK_FACTOR_STORE[store_name(risk_factor_name)] = val;
  }
  function get_risk_factor(risk_factor_name) {
    var key = store_name(risk_factor_name);

    if (key in RISK_FACTOR_STORE) {
      return RISK_FACTOR_STORE[key];
    }

    return undefined;
  } // remove risk factor from storage

  function remove_risk_factor(risk_factor_name) {
    delete RISK_FACTOR_STORE[store_name(risk_factor_name)];
  } // prefix risk factor name with the app/page name

  function store_name(risk_factor_name) {
    return window.location.pathname.split('/').filter(function (el) {
      return !!el;
    }).pop() + '::' + risk_factor_name;
  }

  var canrisk_file = /*#__PURE__*/Object.freeze({
    __proto__: null,
    cancers: cancers,
    genetic_test: genetic_test,
    pathology_tests: pathology_tests,
    get_meta: get_meta,
    get_non_anon_pedigree: get_non_anon_pedigree,
    hasInput: hasInput,
    get_prs_values: get_prs_values,
    readCanRiskV1: readCanRiskV1,
    get_pedigree: get_pedigree,
    show_risk_factor_store: show_risk_factor_store,
    save_risk_factor: save_risk_factor,
    get_risk_factor: get_risk_factor,
    remove_risk_factor: remove_risk_factor,
    store_name: store_name
  });

  function add(opts) {
    $('#load').change(function (e) {
      load(e, opts);
    });
    $('#save').click(function (_e) {
      save$1(opts);
    });
    $('#print').click(function (_e) {
      print(get_printable_svg(opts));
    });
    $('#svg_download').click(function (_e) {
      svg_download(get_printable_svg(opts));
    });
    $('#png_download').click(function (_e) {
      var deferred = svg2img($('svg'), "pedigree");
      $.when.apply($, [deferred]).done(function () {
        var obj = getByName(arguments, "pedigree");

        if (isEdge() || isIE()) {
          var html = "<img src='" + obj.img + "' alt='canvas image'/>";
          var newTab = window.open(); // pop-ups need to be enabled

          newTab.document.write(html);
        } else {
          var a = document.createElement('a');
          a.href = obj.img;
          a.download = 'plot.png';
          a.target = '_blank';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      });
    });
  }
  /**
   * Get object from array by the name attribute.
   */

  function getByName(arr, name) {
    return $.grep(arr, function (o) {
      return o && o.name == name;
    })[0];
  }
  /**
   * Given a SVG document element convert to image (e.g. jpeg, png - default png).
   */


  function svg2img(svg, deferred_name, options) {
    var defaults = {
      iscanvg: false,
      resolution: 1,
      img_type: "image/png"
    };
    if (!options) options = defaults;
    $.each(defaults, function (key, value) {
      if (!(key in options)) {
        options[key] = value;
      }
    }); // set SVG background to white - fix for jpeg creation

    if (svg.find(".pdf-white-bg").length === 0) {
      var d3obj = d3.select(svg.get(0));
      d3obj.append("rect").attr("width", "100%").attr("height", "100%").attr("class", "pdf-white-bg").attr("fill", "white");
      d3obj.select(".pdf-white-bg").lower();
    }

    var deferred = $.Deferred();
    var svgStr;

    if (typeof window.XMLSerializer != "undefined") {
      svgStr = new XMLSerializer().serializeToString(svg.get(0));
    } else if (typeof svg.xml != "undefined") {
      svgStr = svg.get(0).xml;
    }

    var imgsrc = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr))); // convert SVG string to data URL

    var canvas = document.createElement("canvas");
    canvas.width = svg.width() * options.resolution;
    canvas.height = svg.height() * options.resolution;
    var context = canvas.getContext("2d");
    var img = document.createElement("img");

    img.onload = function () {
      if (isIE()) {
        // change font so it isn't tiny
        svgStr = svgStr.replace(/ font-size="\d?.\d*em"/g, '');
        svgStr = svgStr.replace(/<text /g, '<text font-size="12px" ');
        var v = canvg.Canvg.fromString(context, svgStr, {
          scaleWidth: canvas.width,
          scaleHeight: canvas.height,
          ignoreDimensions: true
        });
        v.start();
        console.log(deferred_name, options.img_type, "use canvg to create image");
      } else {
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        console.log(deferred_name, options.img_type);
      }

      deferred.resolve({
        'name': deferred_name,
        'resolution': options.resolution,
        'img': canvas.toDataURL(options.img_type, 1),
        'w': canvas.width,
        'h': canvas.height
      });
    };

    img.src = imgsrc;
    return deferred.promise();
  }

  function getMatches(str, myRegexp) {
    var matches = [];
    var match;
    var c = 0;
    myRegexp.lastIndex = 0;

    while (match = myRegexp.exec(str)) {
      c++;

      if (c > 400) {
        console.error("getMatches: counter exceeded 800");
        return -1;
      }

      matches.push(match);

      if (myRegexp.lastIndex === match.index) {
        myRegexp.lastIndex++;
      }
    }

    return matches;
  } // find all url's to make unique


  function unique_urls(svg_html) {
    var matches = getMatches(svg_html, /url\((&quot;|"|'){0,1}#(.*?)(&quot;|"|'){0,1}\)/g);
    if (matches === -1) return "ERROR DISPLAYING PEDIGREE";
    $.each(matches, function (_index, match) {
      var quote = match[1] ? match[1] : "";
      var val = match[2];
      var m1 = "id=\"" + val + "\"";
      var m2 = "url\\(" + quote + "#" + val + quote + "\\)";
      var newval = val + makeid(2);
      svg_html = svg_html.replace(new RegExp(m1, 'g'), "id=\"" + newval + "\"");
      svg_html = svg_html.replace(new RegExp(m2, 'g'), "url(#" + newval + ")");
    });
    return svg_html;
  } // return a copy pedigree svg


  function copy_svg(opts) {
    var svg_node = get_printable_svg(opts);
    var d3obj = d3.select(svg_node.get(0)); // remove unused elements

    d3obj.selectAll(".popup_selection, .indi_rect, .addsibling, .addpartner, .addchild, .addparents, .delete, .line_drag_selection").remove();
    d3obj.selectAll("text").filter(function () {
      return d3.select(this).text().length === 0;
    }).remove();
    return $(unique_urls(svg_node.html()));
  } // get printable svg div, adjust size to tree dimensions and scale to fit

  function get_printable_svg(opts) {
    var local_dataset = current(opts); // get current dataset

    if (local_dataset !== undefined && local_dataset !== null) {
      opts.dataset = local_dataset;
    }

    var tree_dimensions = get_tree_dimensions(opts);
    var svg_div = $('<div></div>'); // create a new div

    var svg = $('#' + opts.targetDiv).find('svg').clone().appendTo(svg_div);
    var a4 = {
      w: 595 - 80,
      h: 842 - 85
    };

    if (opts.width < tree_dimensions.width || opts.height < tree_dimensions.height || tree_dimensions.width > a4.w || tree_dimensions.height > a4.h) {
      var wid = tree_dimensions.width;
      var hgt = tree_dimensions.height + 100;
      var scale = 1.0;

      if (tree_dimensions.width > a4.w || tree_dimensions.height > a4.h) {
        // scale to fit A4
        if (tree_dimensions.width > a4.w) wid = a4.w;
        if (tree_dimensions.height > a4.h) hgt = a4.h;
        var xscale = wid / tree_dimensions.width;
        var yscale = hgt / tree_dimensions.height;
        scale = xscale < yscale ? xscale : yscale;
      }

      svg.attr('width', wid); // adjust dimensions

      svg.attr('height', hgt);
      var ytransform = -opts.symbol_size * 1.5 * scale;
      svg.find(".diagram").attr("transform", "translate(0, " + ytransform + ") scale(" + scale + ")");
    }

    return svg_div;
  } // download the SVG to a file


  function svg_download(svg) {
    var a = document.createElement('a');
    a.href = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg.html())));
    a.download = 'plot.svg';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } // open print window for a given element

  function print(el, id) {
    if (el.constructor !== Array) el = [el];
    var width = $(window).width() * 0.9;
    var height = $(window).height() - 10;
    var cssFiles = ['/static/css/canrisk.css', 'https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css'];
    var printWindow = window.open('', 'PrintMap', 'width=' + width + ',height=' + height);
    var headContent = '';

    for (var i = 0; i < cssFiles.length; i++) {
      headContent += '<link href="' + cssFiles[i] + '" rel="stylesheet" type="text/css" media="all">';
    }

    headContent += "<style>body {font-size: " + $("body").css('font-size') + ";}</style>";
    var html = "";

    for (var _i2 = 0; _i2 < el.length; _i2++) {
      if (_i2 === 0 && id) html += id;
      html += $(el[_i2]).html();
      if (_i2 < el.length - 1) html += '<div class="page-break"> </div>';
    }

    printWindow.document.write(headContent);
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(function () {
      printWindow.print();
      printWindow.close();
    }, 300);
  } // save content to a file

  function save_file(opts, content, filename, type) {
    if (opts.DEBUG) console.log(content);
    if (!filename) filename = "ped.txt";
    if (!type) type = "text/plain";
    var file = new Blob([content], {
      type: type
    });
    if (window.navigator.msSaveOrOpenBlob) // IE10+
      window.navigator.msSaveOrOpenBlob(file, filename);else {
      // other browsers
      var a = document.createElement("a");
      var url = URL.createObjectURL(file);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
    }
  }

  function save$1(opts) {
    var content = JSON.stringify(current(opts));
    save_file(opts, content);
  }

  function canrisk_validation(opts) {
    $.each(opts.dataset, function (_idx, p) {
      if (!p.hidden && p.sex === 'M' && !isProband(p)) {
        if (p[cancers['breast_cancer2']]) {
          var msg = 'Male family member (' + p.display_name + ') with contralateral breast cancer found. ' + 'Please note that as the risk models do not take this into account the second ' + 'breast cancer is ignored.';
          console.error(msg);
          delete p[cancers['breast_cancer2']];
          messages("Warning", msg);
        }
      }
    });
  }

  function load(e, opts) {
    var f = e.target.files[0];

    if (f) {
      var risk_factors;
      var reader = new FileReader();

      reader.onload = function (e) {
        if (opts.DEBUG) console.log(e.target.result);

        try {
          if (e.target.result.indexOf("BOADICEA import pedigree file format 4.0") === 0) {
            opts.dataset = readBoadiceaV4(e.target.result, 4);
            canrisk_validation(opts);
          } else if (e.target.result.indexOf("BOADICEA import pedigree file format 2.0") === 0) {
            opts.dataset = readBoadiceaV4(e.target.result, 2);
            canrisk_validation(opts);
          } else if (e.target.result.indexOf("##") === 0 && e.target.result.indexOf("CanRisk") !== -1) {
            var canrisk_data = readCanRisk(e.target.result);
            risk_factors = canrisk_data[0];
            opts.dataset = canrisk_data[1];
            canrisk_validation(opts);
          } else {
            try {
              opts.dataset = JSON.parse(e.target.result);
            } catch (err) {
              opts.dataset = readLinkage(e.target.result);
            }
          }

          validate_pedigree(opts);
        } catch (err1) {
          console.error(err1, e.target.result);
          messages("File Error", err1.message ? err1.message : err1);
          return;
        }

        console.log(opts.dataset);

        try {
          setposition(opts); // clear position

          rebuild(opts);
          console.log(risk_factors); // load risk factors - fire riskfactorChange event

          $(document).trigger('riskfactorChange', [opts, risk_factors]);
          $(document).trigger('fhChange', [opts]); // trigger fhChange event

          try {
            // update FH section
            acc_FamHist_ticked();
            acc_FamHist_Leave();
            RESULT.FLAG_FAMILY_MODAL = true;
          } catch (err3) {// ignore error
          }
        } catch (err2) {
          messages("File Error", err2.message ? err2.message : err2);
        }
      };

      reader.onerror = function (event) {
        messages("File Error", "File could not be read! Code " + event.target.error.code);
      };

      reader.readAsText(f);
    } else {
      console.error("File could not be read!");
    }

    $("#load")[0].value = ''; // reset value
  } //
  // https://www.cog-genomics.org/plink/1.9/formats#ped
  // https://www.cog-genomics.org/plink/1.9/formats#fam
  //	1. Family ID ('FID')
  //	2. Within-family ID ('IID'; cannot be '0')
  //	3. Within-family ID of father ('0' if father isn't in dataset)
  //	4. Within-family ID of mother ('0' if mother isn't in dataset)
  //	5. Sex code ('1' = male, '2' = female, '0' = unknown)
  //	6. Phenotype value ('1' = control, '2' = case, '-9'/'0'/non-numeric = missing data if case/control)
  //  7. Genotypes (column 7 onwards);
  //	 columns 7 & 8 are allele calls for first variant ('0' = no call); colummns 9 & 10 are calls for second variant etc.


  function readLinkage(boadicea_lines) {
    var lines = boadicea_lines.trim().split('\n');
    var ped = [];
    var famid;

    for (var i = 0; i < lines.length; i++) {
      var attr = $.map(lines[i].trim().split(/\s+/), function (val, _i) {
        return val.trim();
      });
      if (attr.length < 5) throw 'unknown format';
      var sex = attr[4] == '1' ? 'M' : attr[4] == '2' ? 'F' : 'U';
      var indi = {
        'famid': attr[0],
        'display_name': attr[1],
        'name': attr[1],
        'sex': sex
      };
      if (attr[2] !== "0") indi.father = attr[2];
      if (attr[3] !== "0") indi.mother = attr[3];

      if (typeof famid != 'undefined' && famid !== indi.famid) {
        console.error('multiple family IDs found only using famid = ' + famid);
        break;
      }

      if (attr[5] == "2") indi.affected = 2; // add genotype columns

      if (attr.length > 6) {
        indi.alleles = "";

        for (var j = 6; j < attr.length; j += 2) {
          indi.alleles += attr[j] + "/" + attr[j + 1] + ";";
        }
      }

      ped.unshift(indi);
      famid = attr[0];
    }

    return process_ped(ped);
  }

  function readCanRisk(boadicea_lines) {
    var _readCanRiskV = readCanRiskV1(boadicea_lines),
        _readCanRiskV2 = _slicedToArray(_readCanRiskV, 2),
        hdr = _readCanRiskV2[0],
        ped = _readCanRiskV2[1];

    try {
      return [hdr, process_ped(ped)];
    } catch (e) {
      console.error(e);
      return [hdr, ped];
    }
  } // read boadicea format v4 & v2


  function readBoadiceaV4(boadicea_lines, version) {
    var lines = boadicea_lines.trim().split('\n');
    var ped = []; // assumes two line header

    var _loop = function _loop(i) {
      var attr = $.map(lines[i].trim().split(/\s+/), function (val, _i) {
        return val.trim();
      });

      if (attr.length > 1) {
        var indi = {
          'famid': attr[0],
          'display_name': attr[1],
          'name': attr[3],
          'sex': attr[6],
          'status': attr[8]
        };
        if (attr[2] == 1) indi.proband = true;
        if (attr[4] !== "0") indi.father = attr[4];
        if (attr[5] !== "0") indi.mother = attr[5];
        if (attr[7] !== "0") indi.mztwin = attr[7];
        if (attr[9] !== "0") indi.age = attr[9];
        if (attr[10] !== "0") indi.yob = attr[10];
        var idx = 11;
        $.each(cancers, function (_cancer, diagnosis_age) {
          // Age at 1st cancer or 0 = unaffected, AU = unknown age at diagnosis (affected unknown)
          if (attr[idx] !== "0") {
            indi[diagnosis_age] = attr[idx];
          }

          idx++;
        });

        if (version === 4) {
          if (attr[idx++] !== "0") indi.ashkenazi = 1; // BRCA1, BRCA2, PALB2, ATM, CHEK2 genetic tests
          // type, 0 = untested, S = mutation search, T = direct gene test
          // result, 0 = untested, P = positive, N = negative

          for (var j = 0; j < 5; j++) {
            idx += 2;

            if (attr[idx - 2] !== '0') {
              if ((attr[idx - 2] === 'S' || attr[idx - 2] === 'T') && (attr[idx - 1] === 'P' || attr[idx - 1] === 'N')) indi[genetic_test[j] + '_gene_test'] = {
                'type': attr[idx - 2],
                'result': attr[idx - 1]
              };else console.warn('UNRECOGNISED GENE TEST ON LINE ' + (i + 1) + ": " + attr[idx - 2] + " " + attr[idx - 1]);
            }
          }
        } else if (version === 2) {
          // genetic test BRCA1, BRCA2
          // type, 0 = untested, S = mutation search, T = direct gene test
          // result, 0 = untested, N = no mutation, 1 = BRCA1 positive, 2 = BRCA2 positive, 3 = BRCA1/2 positive
          idx += 2; // gtest

          if (attr[idx - 2] !== '0') {
            if (attr[idx - 2] === 'S' || attr[idx - 2] === 'T') {
              if (attr[idx - 1] === 'N') {
                indi['brca1_gene_test'] = {
                  'type': attr[idx - 2],
                  'result': 'N'
                };
                indi['brca2_gene_test'] = {
                  'type': attr[idx - 2],
                  'result': 'N'
                };
              } else if (attr[idx - 1] === '1') {
                indi['brca1_gene_test'] = {
                  'type': attr[idx - 2],
                  'result': 'P'
                };
                indi['brca2_gene_test'] = {
                  'type': attr[idx - 2],
                  'result': 'N'
                };
              } else if (attr[idx - 1] === '2') {
                indi['brca1_gene_test'] = {
                  'type': attr[idx - 2],
                  'result': 'N'
                };
                indi['brca2_gene_test'] = {
                  'type': attr[idx - 2],
                  'result': 'P'
                };
              } else if (attr[idx - 1] === '3') {
                indi['brca1_gene_test'] = {
                  'type': attr[idx - 2],
                  'result': 'P'
                };
                indi['brca2_gene_test'] = {
                  'type': attr[idx - 2],
                  'result': 'P'
                };
              }
            } else {
              console.warn('UNRECOGNISED GENE TEST ON LINE ' + (i + 1) + ": " + attr[idx - 2] + " " + attr[idx - 1]);
            }
          }

          if (attr[idx++] !== "0") indi.ashkenazi = 1;
        } // status, 0 = unspecified, N = negative, P = positive


        for (var _j = 0; _j < pathology_tests.length; _j++) {
          if (attr[idx] !== '0') {
            if (attr[idx] === 'N' || attr[idx] === 'P') indi[pathology_tests[_j] + '_bc_pathology'] = attr[idx];else console.warn('UNRECOGNISED PATHOLOGY ON LINE ' + (i + 1) + ": " + pathology_tests[_j] + " " + attr[idx]);
          }

          idx++;
        }

        ped.unshift(indi);
      }
    };

    for (var i = 2; i < lines.length; i++) {
      _loop(i);
    }

    try {
      return process_ped(ped);
    } catch (e) {
      console.error(e);
      return ped;
    }
  }

  function process_ped(ped) {
    // find the level of individuals in the pedigree
    for (var j = 0; j < 2; j++) {
      for (var i = 0; i < ped.length; i++) {
        getLevel(ped, ped[i].name);
      }
    } // find the max level (i.e. top_level)


    var max_level = 0;

    for (var _i3 = 0; _i3 < ped.length; _i3++) {
      if (ped[_i3].level && ped[_i3].level > max_level) max_level = ped[_i3].level;
    } // identify top_level and other nodes without parents


    for (var _i4 = 0; _i4 < ped.length; _i4++) {
      if (getDepth(ped, ped[_i4].name) == 1) {
        if (ped[_i4].level && ped[_i4].level == max_level) {
          ped[_i4].top_level = true;
        } else {
          ped[_i4].noparents = true; // 1. look for partners parents

          var pidx = getPartnerIdx(ped, ped[_i4]);

          if (pidx > -1) {
            if (ped[pidx].mother) {
              ped[_i4].mother = ped[pidx].mother;
              ped[_i4].father = ped[pidx].father;
            }
          } // 2. or adopt parents from level above


          if (!ped[_i4].mother) {
            for (var _j2 = 0; _j2 < ped.length; _j2++) {
              if (ped[_i4].level == ped[_j2].level - 1) {
                pidx = getPartnerIdx(ped, ped[_j2]);

                if (pidx > -1) {
                  ped[_i4].mother = ped[_j2].sex === 'F' ? ped[_j2].name : ped[pidx].name;
                  ped[_i4].father = ped[_j2].sex === 'M' ? ped[_j2].name : ped[pidx].name;
                }
              }
            }
          }
        }
      } else {
        delete ped[_i4].top_level;
      }
    }

    return ped;
  } // get the partners for a given node


  function getPartnerIdx(dataset, anode) {
    for (var i = 0; i < dataset.length; i++) {
      var bnode = dataset[i];
      if (anode.name === bnode.mother) return getIdxByName(dataset, bnode.father);else if (anode.name === bnode.father) return getIdxByName(dataset, bnode.mother);
    }

    return -1;
  } // for a given individual assign levels to a parents ancestors


  function getLevel(dataset, name) {
    var idx = getIdxByName(dataset, name);
    var level = dataset[idx].level ? dataset[idx].level : 0;
    update_parents_level(idx, level, dataset);
  } // recursively update parents levels


  function update_parents_level(idx, level, dataset) {
    var parents = ['mother', 'father'];
    level++;

    for (var i = 0; i < parents.length; i++) {
      var pidx = getIdxByName(dataset, dataset[idx][parents[i]]);

      if (pidx >= 0) {
        var ma = dataset[getIdxByName(dataset, dataset[idx].mother)];
        var pa = dataset[getIdxByName(dataset, dataset[idx].father)];

        if (!dataset[pidx].level || dataset[pidx].level < level) {
          ma.level = level;
          pa.level = level;
        }

        if (ma.level < pa.level) {
          ma.level = pa.level;
        } else if (pa.level < ma.level) {
          pa.level = ma.level;
        }

        update_parents_level(pidx, level, dataset);
      }
    }
  }

  var io = /*#__PURE__*/Object.freeze({
    __proto__: null,
    add: add,
    svg2img: svg2img,
    copy_svg: copy_svg,
    svg_download: svg_download,
    print: print,
    save_file: save_file,
    readLinkage: readLinkage,
    readBoadiceaV4: readBoadiceaV4
  });

  $(document).on('fhChange', function (e, opts) {
    try {
      var id = $('#id_name').val(); // get name from hidden field

      var node = getNodeByName(current(opts), id);
      if (node === undefined) $('form > fieldset').prop("disabled", true);else $('form > fieldset').prop('disabled', false);
    } catch (err) {
      console.warn(err);
    }
  }); // update status field and age label - 0 = alive, 1 = dead

  function updateStatus(status) {
    $('#age_yob_lock').removeClass('fa-lock fa-unlock-alt');
    status == 1 ? $('#age_yob_lock').addClass('fa-unlock-alt') : $('#age_yob_lock').addClass('fa-lock');
    $('#id_age_' + status).removeClass("hidden");
    $('#id_age_' + (status == 1 ? '0' : '1')).addClass("hidden");
  }
  function nodeclick(node) {
    $('form > fieldset').prop('disabled', false); // clear values

    $('#person_details').find("input[type=text], input[type=number]").val("");
    $('#person_details select').val('').prop('selected', true); // assign values to input fields in form

    if (node.sex === 'M' || node.sex === 'F') $('input[name=sex][value="' + node.sex + '"]').prop('checked', true);else $('input[name=sex]').prop('checked', false);
    update_cancer_by_sex(node);
    if (!('status' in node)) node.status = 0;
    $('input[name=status][value="' + node.status + '"]').prop('checked', true); // show lock symbol for age and yob synchronisation

    updateStatus(node.status);

    if ('proband' in node) {
      $('#id_proband').prop('checked', node.proband);
      $('#id_proband').prop("disabled", true);
    } else {
      $('#id_proband').prop('checked', false);
      $('#id_proband').prop("disabled", !('yob' in node));
    }

    if ('exclude' in node) {
      $('#id_exclude').prop('checked', node.exclude);
    } else {
      $('#id_exclude').prop('checked', false);
    }
    /*		if('ashkenazi' in node) {
    			$('#id_ashkenazi').prop('checked', (node.proband == 1 ? true: false));
    		} else {
    			$('#id_ashkenazi').prop('checked', false);
    		}*/
    // year of birth


    if ('yob' in node) {
      $('#id_yob_0').val(node.yob);
    } else {
      $('#id_yob_0').val('-');
    } // clear pathology


    $('select[name$="_bc_pathology"]').val('-'); // clear gene tests

    $('select[name*="_gene_test"]').val('-'); // disable sex radio buttons if the person has a partner

    $("input[id^='id_sex_']").prop("disabled", node.parent_node && node.sex !== 'U' ? true : false); // disable pathology for male relatives (as not used by model)
    // and if no breast cancer age of diagnosis

    $("select[id$='_bc_pathology']").prop("disabled", node.sex === 'M' || node.sex === 'F' && !('breast_cancer_diagnosis_age' in node) ? true : false); // approximate diagnosis age

    $('#id_approx').prop('checked', node.approx_diagnosis_age ? true : false);
    update_diagnosis_age_widget();

    for (var key in node) {
      if (key !== 'proband' && key !== 'sex') {
        if ($('#id_' + key).length) {
          // input value
          if (key.indexOf('_gene_test') !== -1 && node[key] !== null && _typeof(node[key]) === 'object') {
            $('#id_' + key).val(node[key].type);
            $('#id_' + key + '_result').val(node[key].result);
          } else {
            $('#id_' + key).val(node[key]);
          }
        } else if (key.indexOf('_diagnosis_age') !== -1) {
          if ($("#id_approx").is(':checked')) {
            $('#id_' + key + '_1').val(round5(node[key])).prop('selected', true);
          } else {
            $('#id_' + key + '_0').val(node[key]);
          }
        }
      }
    }

    try {
      $('#person_details').find('form').valid();
    } catch (err) {
      console.warn('valid() not found');
    }
  }

  function update_ashkn(newdataset) {
    // Ashkenazi status, 0 = not Ashkenazi, 1 = Ashkenazi
    if ($('#orig_ashk').is(':checked')) {
      $.each(newdataset, function (_i, p) {
        if (p.proband) p.ashkenazi = 1;
      });
    } else {
      $.each(newdataset, function (_i, p) {
        delete p.ashkenazi;
      });
    }
  } // Save Ashkenazi status


  function save_ashkn(opts) {
    var dataset = current(opts);
    var newdataset = copy_dataset(dataset);
    update_ashkn(newdataset);
    opts.dataset = newdataset;
    rebuild(opts);
  }
  function save(opts) {
    var dataset = current(opts);
    var name = $('#id_name').val();
    var newdataset = copy_dataset(dataset);
    var person = getNodeByName(newdataset, name);

    if (!person) {
      console.warn('person not found when saving details');
      return;
    }

    $("#" + opts.targetDiv).empty(); // individual's personal and clinical details

    var yob = $('#id_yob_0').val();

    if (yob && yob !== '') {
      person.yob = yob;
    } else {
      delete person.yob;
    } // current status: 0 = alive, 1 = dead


    var status = $('#id_status').find("input[type='radio']:checked");

    if (status.length > 0) {
      person.status = status.val();
    } // booleans switches


    var switches = ["miscarriage", "adopted_in", "adopted_out", "termination", "stillbirth"];

    for (var iswitch = 0; iswitch < switches.length; iswitch++) {
      var attr = switches[iswitch];
      var s = $('#id_' + attr);

      if (s.length > 0) {
        console.log(s.is(":checked"));
        if (s.is(":checked")) person[attr] = true;else delete person[attr];
      }
    } // current sex


    var sex = $('#id_sex').find("input[type='radio']:checked");

    if (sex.length > 0) {
      person.sex = sex.val();
      update_cancer_by_sex(person);
    } // Ashkenazi status, 0 = not Ashkenazi, 1 = Ashkenazi


    update_ashkn(newdataset);
    if ($('#id_approx').is(':checked')) // approximate diagnosis age
      person.approx_diagnosis_age = true;else delete person.approx_diagnosis_age;
    $("#person_details select[name*='_diagnosis_age']:visible, #person_details input[type=text]:visible, #person_details input[type=number]:visible").each(function () {
      var name = this.name.indexOf("_diagnosis_age") > -1 ? this.name.substring(0, this.name.length - 2) : this.name;

      if ($(this).val()) {
        var val = $(this).val();
        if (name.indexOf("_diagnosis_age") > -1 && $("#id_approx").is(':checked')) val = round5(val);
        person[name] = val;
      } else {
        delete person[name];
      }
    }); // cancer checkboxes

    $('#person_details input[type="checkbox"][name$="cancer"],input[type="checkbox"][name$="cancer2"]').each(function () {
      if (this.checked) person[$(this).attr('name')] = true;else delete person[$(this).attr('name')];
    }); // pathology tests

    $('#person_details select[name$="_bc_pathology"]').each(function () {
      if ($(this).val() !== '-') {
        person[$(this).attr('name')] = $(this).val();
      } else {
        delete person[$(this).attr('name')];
      }
    }); // genetic tests

    $('#person_details select[name$="_gene_test"]').each(function () {
      if ($(this).val() !== '-') {
        var tres = $('select[name="' + $(this).attr('name') + '_result"]');
        person[$(this).attr('name')] = {
          'type': $(this).val(),
          'result': $(tres).val()
        };
      } else {
        delete person[$(this).attr('name')];
      }
    });

    try {
      $('#person_details').find('form').valid();
    } catch (err) {
      console.warn('valid() not found');
    }

    syncTwins(newdataset, person);
    opts.dataset = newdataset;
    rebuild(opts);
  }
  function update_diagnosis_age_widget() {
    if ($("#id_approx").is(':checked')) {
      $("[id$='_diagnosis_age_0']").each(function (_i) {
        if ($(this).val() !== '') {
          var name = this.name.substring(0, this.name.length - 2);
          $("#id_" + name + "_1").val(round5($(this).val())).prop('selected', true);
        }
      });
      $("[id$='_diagnosis_age_0']").hide();
      $("[id$='_diagnosis_age_1']").show();
    } else {
      $("[id$='_diagnosis_age_1']").each(function (_i) {
        if ($(this).val() !== '') {
          var name = this.name.substring(0, this.name.length - 2);
          $("#id_" + name + "_0").val($(this).val());
        }
      });
      $("[id$='_diagnosis_age_0']").show();
      $("[id$='_diagnosis_age_1']").hide();
    }
  } // males should not have ovarian cancer and females should not have prostate cancer

  function update_cancer_by_sex(node) {
    $('#cancer .row').show();

    if (node.sex === 'M') {
      delete node.ovarian_cancer_diagnosis_age;
      $("[id^='id_ovarian_cancer_diagnosis_age']").closest('.row').hide();
      $("[id^='id_breast_cancer2_diagnosis_age']").prop('disabled', true);
    } else if (node.sex === 'F') {
      delete node.prostate_cancer_diagnosis_age;
      $("[id^='id_prostate_cancer_diagnosis_age']").closest('.row').hide();
      $("[id^='id_breast_cancer2_diagnosis_age']").prop('disabled', false);
    }
  } // round to 5, 15, 25, 35 ....


  function round5(x1) {
    var x2 = Math.round((x1 - 1) / 10) * 10;
    return x1 < x2 ? x2 - 5 : x2 + 5;
  }

  var pedigree_form = /*#__PURE__*/Object.freeze({
    __proto__: null,
    updateStatus: updateStatus,
    nodeclick: nodeclick,
    save_ashkn: save_ashkn,
    save: save,
    update_diagnosis_age_widget: update_diagnosis_age_widget
  });

  // pedigree widgets
  var dragging;
  var last_mouseover; //
  // Add widgets to nodes and bind events

  function addWidgets(opts, node) {
    // popup gender selection box
    var font_size = parseInt($("body").css('font-size'));
    var popup_selection = d3.select('.diagram');
    popup_selection.append("rect").attr("class", "popup_selection").attr("rx", 6).attr("ry", 6).attr("transform", "translate(-1000,-100)").style("opacity", 0).attr("width", font_size * 7.9).attr("height", font_size * 2).style("stroke", "darkgrey").attr("fill", "white");
    var square = popup_selection.append("text") // male
    .attr('font-family', 'FontAwesome').style("opacity", 0).attr('font-size', '1.em').attr("class", "popup_selection fa-lg fa-square persontype").attr("transform", "translate(-1000,-100)").attr("x", font_size / 3).attr("y", font_size * 1.5).text("\uF096 ");
    var square_title = square.append("svg:title").text("add male");
    var circle = popup_selection.append("text") // female
    .attr('font-family', 'FontAwesome').style("opacity", 0).attr('font-size', '1.em').attr("class", "popup_selection fa-lg fa-circle persontype").attr("transform", "translate(-1000,-100)").attr("x", font_size * 1.7).attr("y", font_size * 1.5).text("\uF10C ");
    var circle_title = circle.append("svg:title").text("add female");
    var unspecified = popup_selection.append("text") // unspecified
    .attr('font-family', 'FontAwesome').style("opacity", 0).attr('font-size', '1.em').attr("transform", "translate(-1000,-100)").attr("class", "popup_selection fa-lg fa-unspecified popup_selection_rotate45 persontype").text("\uF096 ");
    unspecified.append("svg:title").text("add unspecified");
    var dztwin = popup_selection.append("text") // dizygotic twins
    .attr('font-family', 'FontAwesome').style("opacity", 0).attr("transform", "translate(-1000,-100)").attr("class", "popup_selection fa-2x fa-angle-up persontype dztwin").attr("x", font_size * 4.6).attr("y", font_size * 1.5).text("\uF106 ");
    dztwin.append("svg:title").text("add dizygotic/fraternal twins");
    var mztwin = popup_selection.append("text") // monozygotic twins
    .attr('font-family', 'FontAwesome').style("opacity", 0).attr("transform", "translate(-1000,-100)").attr("class", "popup_selection fa-2x fa-caret-up persontype mztwin").attr("x", font_size * 6.2).attr("y", font_size * 1.5).text("\uF0D8");
    mztwin.append("svg:title").text("add monozygotic/identical twins");
    var add_person = {}; // click the person type selection

    d3.selectAll(".persontype").on("click", function () {
      var newdataset = copy_dataset(current(opts));
      var mztwin = d3.select(this).classed("mztwin");
      var dztwin = d3.select(this).classed("dztwin");
      var twin_type;
      var sex;

      if (mztwin || dztwin) {
        sex = add_person.node.datum().data.sex;
        twin_type = mztwin ? "mztwin" : "dztwin";
      } else {
        sex = d3.select(this).classed("fa-square") ? 'M' : d3.select(this).classed("fa-circle") ? 'F' : 'U';
      }

      if (add_person.type === 'addsibling') addsibling(newdataset, add_person.node.datum().data, sex, false, twin_type);else if (add_person.type === 'addchild') addchild(newdataset, add_person.node.datum().data, twin_type ? 'U' : sex, twin_type ? 2 : 1, twin_type);else return;
      opts.dataset = newdataset;
      rebuild(opts);
      d3.selectAll('.popup_selection').style("opacity", 0);
      add_person = {};
    }).on("mouseover", function () {
      if (add_person.node) add_person.node.select('rect').style("opacity", 0.2);
      d3.selectAll('.popup_selection').style("opacity", 1); // add tooltips to font awesome widgets

      if (add_person.type === 'addsibling') {
        if (d3.select(this).classed("fa-square")) square_title.text("add brother");else circle_title.text("add sister");
      } else if (add_person.type === 'addchild') {
        if (d3.select(this).classed("fa-square")) square_title.text("add son");else circle_title.text("add daughter");
      }
    }); // handle mouse out of popup selection

    d3.selectAll(".popup_selection").on("mouseout", function () {
      // hide rect and popup selection
      if (add_person.node !== undefined && highlight.indexOf(add_person.node.datum()) == -1) add_person.node.select('rect').style("opacity", 0);
      d3.selectAll('.popup_selection').style("opacity", 0);
    }); // drag line between nodes to create partners

    drag_handle(opts); // rectangle used to highlight on mouse over

    node.filter(function (d) {
      return d.data.hidden && !opts.DEBUG ? false : true;
    }).append("rect").attr("class", 'indi_rect').attr("rx", 6).attr("ry", 6).attr("x", function (_d) {
      return -0.75 * opts.symbol_size;
    }).attr("y", function (_d) {
      return -opts.symbol_size;
    }).attr("width", 1.5 * opts.symbol_size + 'px').attr("height", 2 * opts.symbol_size + 'px').style("stroke", "black").style("stroke-width", 0.7).style("opacity", 0).attr("fill", "lightgrey"); // widgets

    var fx = function fx(_d) {
      return off - 0.75 * opts.symbol_size;
    };

    var fy = opts.symbol_size - 2;
    var off = 0;
    var widgets = {
      'addchild': {
        'text': "\uF063",
        'title': 'add child',
        'fx': fx,
        'fy': fy
      },
      'addsibling': {
        'text': "\uF234",
        'title': 'add sibling',
        'fx': fx,
        'fy': fy
      },
      'addpartner': {
        'text': "\uF0C1",
        'title': 'add partner',
        'fx': fx,
        'fy': fy
      },
      'addparents': {
        'text': "\uF062",
        'title': 'add parents',
        'fx': -0.75 * opts.symbol_size,
        'fy': -opts.symbol_size + 11
      },
      'delete': {
        'text': 'X',
        'title': 'delete',
        'fx': opts.symbol_size / 2 - 1,
        'fy': -opts.symbol_size + 12,
        'styles': {
          "font-weight": "bold",
          "fill": "darkred",
          "font-family": "monospace"
        }
      }
    };

    if (opts.edit) {
      widgets.settings = {
        'text': "\uF013",
        'title': 'settings',
        'fx': -font_size / 2 + 2,
        'fy': -opts.symbol_size + 11
      };
    }

    var _loop = function _loop(key) {
      var widget = node.filter(function (d) {
        return (d.data.hidden && !opts.DEBUG ? false : true) && !((d.data.mother === undefined || d.data.noparents) && key === 'addsibling') && !(d.data.parent_node !== undefined && d.data.parent_node.length > 1 && key === 'addpartner') && !(d.data.parent_node === undefined && key === 'addchild') && !(d.data.noparents === undefined && d.data.top_level === undefined && key === 'addparents');
      }).append("text").attr("class", key).style("opacity", 0).attr('font-family', 'FontAwesome').attr("xx", function (d) {
        return d.x;
      }).attr("yy", function (d) {
        return d.y;
      }).attr("x", widgets[key].fx).attr("y", widgets[key].fy).attr('font-size', '0.9em').text(widgets[key].text);
      if ('styles' in widgets[key]) for (var style in widgets[key].styles) {
        widget.attr(style, widgets[key].styles[style]);
      }
      widget.append("svg:title").text(widgets[key].title);
      off += 17;
    };

    for (var key in widgets) {
      _loop(key);
    } // add sibling or child


    d3.selectAll(".addsibling, .addchild").on("mouseover", function () {
      var type = d3.select(this).attr('class');
      d3.selectAll('.popup_selection').style("opacity", 1);
      add_person = {
        'node': d3.select(this.parentNode),
        'type': type
      }; //let translate = getTranslation(d3.select('.diagram').attr("transform"));

      var x = parseInt(d3.select(this).attr("xx")) + parseInt(d3.select(this).attr("x"));
      var y = parseInt(d3.select(this).attr("yy")) + parseInt(d3.select(this).attr("y"));
      d3.selectAll('.popup_selection').attr("transform", "translate(" + x + "," + (y + 2) + ")");
      d3.selectAll('.popup_selection_rotate45').attr("transform", "translate(" + (x + 3 * font_size) + "," + (y + font_size * 1.2) + ") rotate(45)");
    }); // handle widget clicks

    d3.selectAll(".addchild, .addpartner, .addparents, .delete, .settings").on("click", function () {
      d3.event.stopPropagation();
      var opt = d3.select(this).attr('class');
      var d = d3.select(this.parentNode).datum();

      if (opts.DEBUG) {
        console.log(opt);
      }

      var newdataset;

      if (opt === 'settings') {
        if (typeof opts.edit === 'function') {
          opts.edit(opts, d);
        } else {
          openEditDialog(opts, d);
        }
      } else if (opt === 'delete') {
        newdataset = copy_dataset(current(opts));
        delete_node_dataset(newdataset, d.data, opts, onDone);
      } else if (opt === 'addparents') {
        newdataset = copy_dataset(current(opts));
        opts.dataset = newdataset;
        addparents(opts, newdataset, d.data.name);
        rebuild(opts);
      } else if (opt === 'addpartner') {
        newdataset = copy_dataset(current(opts));
        addpartner(opts, newdataset, d.data.name);
        opts.dataset = newdataset;
        rebuild(opts);
      } // trigger fhChange event


      $(document).trigger('fhChange', [opts]);
    }); // other mouse events

    var highlight = [];
    node.filter(function (d) {
      return !d.data.hidden;
    }).on("click", function (d) {
      if (d3.event.ctrlKey) {
        if (highlight.indexOf(d) == -1) highlight.push(d);else highlight.splice(highlight.indexOf(d), 1);
      } else highlight = [d];

      if ('nodeclick' in opts) {
        opts.nodeclick(d.data);
        d3.selectAll(".indi_rect").style("opacity", 0);
        d3.selectAll('.indi_rect').filter(function (d) {
          return highlight.indexOf(d) != -1;
        }).style("opacity", 0.5);
      }
    }).on("mouseover", function (d) {
      d3.event.stopPropagation();
      last_mouseover = d;

      if (dragging) {
        if (dragging.data.name !== last_mouseover.data.name && dragging.data.sex !== last_mouseover.data.sex) {
          d3.select(this).select('rect').style("opacity", 0.2);
        }

        return;
      }

      d3.select(this).select('rect').style("opacity", 0.2);
      d3.select(this).selectAll('.addchild, .addsibling, .addpartner, .addparents, .delete, .settings').style("opacity", 1);
      d3.select(this).selectAll('.indi_details').style("opacity", 0);
      setLineDragPosition(opts.symbol_size - 10, 0, opts.symbol_size - 2, 0, d.x + "," + (d.y + 2));
    }).on("mouseout", function (d) {
      if (dragging) return;
      d3.select(this).selectAll('.addchild, .addsibling, .addpartner, .addparents, .delete, .settings').style("opacity", 0);
      if (highlight.indexOf(d) == -1) d3.select(this).select('rect').style("opacity", 0);
      d3.select(this).selectAll('.indi_details').style("opacity", 1); // hide popup if it looks like the mouse is moving north

      var xcoord = d3.mouse(this)[0];
      var ycoord = d3.mouse(this)[1];
      if (ycoord < 0.8 * opts.symbol_size) d3.selectAll('.popup_selection').style("opacity", 0);

      if (!dragging) {
        // hide popup if it looks like the mouse is moving north, south or west
        if (Math.abs(ycoord) > 0.25 * opts.symbol_size || Math.abs(ycoord) < -0.25 * opts.symbol_size || xcoord < 0.2 * opts.symbol_size) {
          setLineDragPosition(0, 0, 0, 0);
        }
      }
    });
  }

  function onDone(opts, dataset) {
    // assign new dataset and rebuild pedigree
    opts.dataset = dataset;
    rebuild(opts);
  } // drag line between nodes to create partners


  function drag_handle(opts) {
    var line_drag_selection = d3.select('.diagram');
    var dline = line_drag_selection.append("line").attr("class", 'line_drag_selection').attr("stroke-width", 6).style("stroke-dasharray", "2, 1").attr("stroke", "black").call(d3.drag().on("start", dragstart).on("drag", drag).on("end", dragstop));
    dline.append("svg:title").text("drag to create consanguineous partners");
    setLineDragPosition(0, 0, 0, 0);

    function dragstart() {
      dragging = last_mouseover;
      d3.selectAll('.line_drag_selection').attr("stroke", "darkred");
    }

    function dragstop(_d) {
      if (last_mouseover && dragging.data.name !== last_mouseover.data.name && dragging.data.sex !== last_mouseover.data.sex) {
        // make partners
        var child = {
          "name": makeid(4),
          "sex": 'U',
          "mother": dragging.data.sex === 'F' ? dragging.data.name : last_mouseover.data.name,
          "father": dragging.data.sex === 'F' ? last_mouseover.data.name : dragging.data.name
        };
        var newdataset = copy_dataset(opts.dataset);
        opts.dataset = newdataset;
        var idx = getIdxByName(opts.dataset, dragging.data.name) + 1;
        opts.dataset.splice(idx, 0, child);
        rebuild(opts);
      }

      setLineDragPosition(0, 0, 0, 0);
      d3.selectAll('.line_drag_selection').attr("stroke", "black");
      dragging = undefined;
      return;
    }

    function drag(_d) {
      d3.event.sourceEvent.stopPropagation();
      var dx = d3.event.dx;
      var dy = d3.event.dy;
      var xnew = parseFloat(d3.select(this).attr('x2')) + dx;
      var ynew = parseFloat(d3.select(this).attr('y2')) + dy;
      setLineDragPosition(opts.symbol_size - 10, 0, xnew, ynew);
    }
  }

  function setLineDragPosition(x1, y1, x2, y2, translate) {
    if (translate) d3.selectAll('.line_drag_selection').attr("transform", "translate(" + translate + ")");
    d3.selectAll('.line_drag_selection').attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2);
  }

  function capitaliseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  } // if opt.edit is set true (rather than given a function) this is called to edit node attributes


  function openEditDialog(opts, d) {
    $('#node_properties').dialog({
      autoOpen: false,
      title: d.data.display_name,
      width: $(window).width() > 400 ? 450 : $(window).width() - 30
    });
    var table = "<table id='person_details' class='table'>";
    table += "<tr><td style='text-align:right'>Unique ID</td><td><input class='form-control' type='text' id='id_name' name='name' value=" + (d.data.name ? d.data.name : "") + "></td></tr>";
    table += "<tr><td style='text-align:right'>Name</td><td><input class='form-control' type='text' id='id_display_name' name='display_name' value=" + (d.data.display_name ? d.data.display_name : "") + "></td></tr>";
    table += "<tr><td style='text-align:right'>Age</td><td><input class='form-control' type='number' id='id_age' min='0' max='120' name='age' style='width:7em' value=" + (d.data.age ? d.data.age : "") + "></td></tr>";
    table += "<tr><td style='text-align:right'>Year Of Birth</td><td><input class='form-control' type='number' id='id_yob' min='1900' max='2050' name='yob' style='width:7em' value=" + (d.data.yob ? d.data.yob : "") + "></td></tr>";
    table += '<tr><td colspan="2" id="id_sex">' + '<label class="radio-inline"><input type="radio" name="sex" value="M" ' + (d.data.sex === 'M' ? "checked" : "") + '>Male</label>' + '<label class="radio-inline"><input type="radio" name="sex" value="F" ' + (d.data.sex === 'F' ? "checked" : "") + '>Female</label>' + '<label class="radio-inline"><input type="radio" name="sex" value="U">Unknown</label>' + '</td></tr>'; // alive status = 0; dead status = 1

    table += '<tr><td colspan="2" id="id_status">' + '<label class="checkbox-inline"><input type="radio" name="status" value="0" ' + (parseInt(d.data.status) === 0 ? "checked" : "") + '>&thinsp;Alive</label>' + '<label class="checkbox-inline"><input type="radio" name="status" value="1" ' + (parseInt(d.data.status) === 1 ? "checked" : "") + '>&thinsp;Deceased</label>' + '</td></tr>';
    $("#id_status input[value='" + d.data.status + "']").prop('checked', true); // switches

    var switches = ["adopted_in", "adopted_out", "miscarriage", "stillbirth", "termination"];
    table += '<tr><td colspan="2"><strong>Reproduction:</strong></td></tr>';
    table += '<tr><td colspan="2">';

    for (var iswitch = 0; iswitch < switches.length; iswitch++) {
      var attr = switches[iswitch];
      if (iswitch === 2) table += '</td></tr><tr><td colspan="2">';
      table += '<label class="checkbox-inline"><input type="checkbox" id="id_' + attr + '" name="' + attr + '" value="0" ' + (d.data[attr] ? "checked" : "") + '>&thinsp;' + capitaliseFirstLetter(attr.replace('_', ' ')) + '</label>';
    }

    table += '</td></tr>'; //

    var exclude = ["children", "name", "parent_node", "top_level", "id", "noparents", "level", "age", "sex", "status", "display_name", "mother", "father", "yob", "mztwin", "dztwin"];
    $.merge(exclude, switches);
    table += '<tr><td colspan="2"><strong>Age of Diagnosis:</strong></td></tr>';
    $.each(opts.diseases, function (k, v) {
      exclude.push(v.type + "_diagnosis_age");
      var disease_colour = '&thinsp;<span style="padding-left:5px;background:' + opts.diseases[k].colour + '"></span>';
      var diagnosis_age = d.data[v.type + "_diagnosis_age"];
      table += "<tr><td style='text-align:right'>" + capitaliseFirstLetter(v.type.replace("_", " ")) + disease_colour + "&nbsp;</td><td>" + "<input class='form-control' id='id_" + v.type + "_diagnosis_age_0' max='110' min='0' name='" + v.type + "_diagnosis_age_0' style='width:5em' type='number' value='" + (diagnosis_age !== undefined ? diagnosis_age : "") + "'></td></tr>";
    });
    table += '<tr><td colspan="2" style="line-height:1px;"></td></tr>';
    $.each(d.data, function (k, v) {
      if ($.inArray(k, exclude) == -1) {
        var kk = capitaliseFirstLetter(k);

        if (v === true || v === false) {
          table += "<tr><td style='text-align:right'>" + kk + "&nbsp;</td><td><input type='checkbox' id='id_" + k + "' name='" + k + "' value=" + v + " " + (v ? "checked" : "") + "></td></tr>";
        } else if (k.length > 0) {
          table += "<tr><td style='text-align:right'>" + kk + "&nbsp;</td><td><input type='text' id='id_" + k + "' name='" + k + "' value=" + v + "></td></tr>";
        }
      }
    });
    table += "</table>";
    $('#node_properties').html(table);
    $('#node_properties').dialog('open');
    $('#node_properties input[type=radio], #node_properties input[type=checkbox], #node_properties input[type=text], #node_properties input[type=number]').change(function () {
      save(opts);
    });
    return;
  }

  function addLabels(opts, node) {
    // names of individuals
    addLabel(opts, node, -(0.4 * opts.symbol_size), -(0.1 * opts.symbol_size), function (d) {
      if (opts.DEBUG) return ('display_name' in d.data ? d.data.display_name : d.data.name) + '  ' + d.data.id;
      return 'display_name' in d.data ? d.data.display_name : '';
    }, undefined, ['display_name']);
    var font_size = parseInt(getPx(opts)) + 4; // display age/yob label first

    var _loop = function _loop(ilab) {
      var label = opts.labels[ilab];
      var arr = Array.isArray(label) ? label : [label];

      if (arr.indexOf('age') > -1 || arr.indexOf('yob') > -1) {
        addLabel(opts, node, -opts.symbol_size, function (d) {
          return ypos(d, arr, font_size);
        }, function (d) {
          return get_text(d, arr);
        }, 'indi_details', arr);
      }
    };

    for (var ilab = 0; ilab < opts.labels.length; ilab++) {
      _loop(ilab);
    } // individuals disease details


    var _loop2 = function _loop2(i) {
      var disease = opts.diseases[i].type;
      addLabel(opts, node, -opts.symbol_size, function (d) {
        return ypos(d, [disease], font_size);
      }, function (d) {
        var dis = disease.replace('_', ' ').replace('cancer', 'ca.');
        return disease + '_diagnosis_age' in d.data ? dis + ": " + d.data[disease + '_diagnosis_age'] : '';
      }, 'indi_details', [disease]);
    };

    for (var i = 0; i < opts.diseases.length; i++) {
      _loop2(i);
    } // display other labels defined in opts.labels e.g. alleles/genotype data


    var _loop3 = function _loop3(_ilab) {
      var label = opts.labels[_ilab];
      var arr = Array.isArray(label) ? label : [label];

      if (arr.indexOf('age') === -1 && arr.indexOf('yob') === -1) {
        addLabel(opts, node, -opts.symbol_size, function (d) {
          return ypos(d, arr, font_size);
        }, function (d) {
          return get_text(d, arr);
        }, 'indi_details', arr);
      }
    };

    for (var _ilab = 0; _ilab < opts.labels.length; _ilab++) {
      _loop3(_ilab);
    }
  }

  function get_text(d, arr) {
    var txt = "";

    for (var l = 0; l < arr.length; l++) {
      var this_label = arr[l];

      if (d.data[this_label]) {
        if (this_label === 'alleles') {
          var vars = d.data.alleles.split(';');

          for (var ivar = 0; ivar < vars.length; ivar++) {
            if (vars[ivar] !== "") txt += vars[ivar] + ';';
          }
        } else if (this_label === 'age') {
          txt += d.data[this_label] + 'y ';
        } else if (this_label === 'stillbirth') {
          txt += "SB";
        } else if (this_label.match("_gene_test$") && 'result' in d.data[this_label]) {
          var r = d.data[this_label]['result'].toUpperCase(); //let t = d.data[this_label]['type'];

          if (r !== "-") {
            txt += this_label.replace('_gene_test', '').toUpperCase();
            txt += r === 'P' ? '+ ' : r === 'N' ? '- ' : ' ';
          }
        } else if (this_label.match("_bc_pathology$")) {
          var _r = d.data[this_label].toUpperCase();

          txt += this_label.replace('_bc_pathology', '').toUpperCase();
          txt += _r === 'P' ? '+ ' : _r === 'N' ? '- ' : ' ';
        } else {
          txt += d.data[this_label];
        }
      }
    }

    if (txt !== "") return txt;
  }

  function ypos(d, arr, font_size) {
    if (!node_has_label(d, arr)) return;
    d.y_offset = !d.y_offset ? font_size * 2.35 : d.y_offset + font_size;
    return d.y_offset;
  }

  function node_has_label(d, labels) {
    for (var l = 0; l < labels.length; l++) {
      if (prefixInObj(labels[l], d.data)) return true;
    }

    return false;
  } // add label to node


  function addLabel(opts, node, fx, fy, ftext, class_label, labels) {
    node.filter(function (d) {
      return !d.data.hidden && (!labels || node_has_label(d, labels));
    }).append("text").attr("class", class_label ? class_label + ' ped_label' : 'ped_label').attr("x", fx).attr("y", fy).attr("font-family", opts.font_family).attr("font-size", opts.font_size).attr("font-weight", opts.font_weight).text(ftext);
  } // get height in pixels


  function getPx(opts) {
    var emVal = opts.font_size;
    if (emVal === parseInt(emVal, 10)) // test if integer
      return emVal;
    if (emVal.indexOf("px") > -1) return emVal.replace('px', '');else if (emVal.indexOf("em") === -1) return emVal;
    emVal = parseFloat(emVal.replace('em', ''));
    return parseFloat(getComputedStyle($('#' + opts.targetDiv).get(0)).fontSize) * emVal - 1.0;
  }

  var roots = {};
  function build(options) {
    var opts = $.extend({
      // defaults
      targetDiv: 'pedigree_edit',
      dataset: [{
        "name": "m21",
        "display_name": "father",
        "sex": "M",
        "top_level": true
      }, {
        "name": "f21",
        "display_name": "mother",
        "sex": "F",
        "top_level": true
      }, {
        "name": "ch1",
        "display_name": "me",
        "sex": "F",
        "mother": "f21",
        "father": "m21",
        "proband": true
      }],
      width: 600,
      height: 400,
      symbol_size: 35,
      zoomSrc: ['wheel', 'button'],
      zoomIn: 1.0,
      zoomOut: 1.0,
      diseases: [{
        'type': 'breast_cancer',
        'colour': '#F68F35'
      }, {
        'type': 'breast_cancer2',
        'colour': 'pink'
      }, {
        'type': 'ovarian_cancer',
        'colour': '#4DAA4D'
      }, {
        'type': 'pancreatic_cancer',
        'colour': '#4289BA'
      }, {
        'type': 'prostate_cancer',
        'colour': '#D5494A'
      }],
      labels: ['stillbirth', ['age', 'yob'], 'alleles', ['brca1_gene_test', 'brca2_gene_test', 'palb2_gene_test', 'chek2_gene_test', 'atm_gene_test'], ['rad51d_gene_test', 'rad51c_gene_test', 'brip1_gene_test'], ['er_bc_pathology', 'pr_bc_pathology', 'her2_bc_pathology', 'ck14_bc_pathology', 'ck56_bc_pathology']],
      keep_proband_on_reset: false,
      font_size: '.75em',
      font_family: 'Helvetica',
      font_weight: 700,
      background: "#EEE",
      node_background: '#fdfdfd',
      validate: true,
      DEBUG: false
    }, options);

    if ($("#fullscreen").length === 0) {
      // add undo, redo, fullscreen buttons and event listeners once
      add$1(opts);
      add(opts);
    }

    if (nstore(opts) == -1) init_cache(opts);
    updateButtons(opts); // validate pedigree data

    validate_pedigree(opts); // group top level nodes by partners

    opts.dataset = group_top_level(opts.dataset);
    if (opts.DEBUG) print_opts(opts);
    var svg_dimensions = get_svg_dimensions(opts);
    var svg = d3.select("#" + opts.targetDiv).append("svg:svg").attr("width", svg_dimensions.width).attr("height", svg_dimensions.height);
    svg.append("rect").attr("width", "100%").attr("height", "100%").attr("rx", 6).attr("ry", 6).style("stroke", "darkgrey").style("fill", opts.background) // or none
    .style("stroke-width", 1);
    var ped = svg.append("g").attr("class", "diagram");
    var top_level = $.map(opts.dataset, function (val, _i) {
      return 'top_level' in val && val.top_level ? val : null;
    });
    var hidden_root = {
      name: 'hidden_root',
      id: 0,
      hidden: true,
      children: top_level
    };
    var partners = buildTree(opts, hidden_root, hidden_root)[0];
    var root = d3.hierarchy(hidden_root);
    roots[opts.targetDiv] = root; // / get score at each depth used to adjust node separation

    var tree_dimensions = get_tree_dimensions(opts);
    if (opts.DEBUG) console.log('opts.width=' + svg_dimensions.width + ' width=' + tree_dimensions.width + ' opts.height=' + svg_dimensions.height + ' height=' + tree_dimensions.height);
    var treemap = d3.tree().separation(function (a, b) {
      return a.parent === b.parent || a.data.hidden || b.data.hidden ? 1.2 : 2.2;
    }).size([tree_dimensions.width, tree_dimensions.height]);
    var nodes = treemap(root.sort(function (a, b) {
      return a.data.id - b.data.id;
    }));
    var flattenNodes = nodes.descendants(); // check the number of visible nodes equals the size of the pedigree dataset

    var vis_nodes = $.map(opts.dataset, function (p, _i) {
      return p.hidden ? null : p;
    });

    if (vis_nodes.length != opts.dataset.length) {
      throw create_err('NUMBER OF VISIBLE NODES DIFFERENT TO NUMBER IN THE DATASET');
    }

    adjust_coords(opts, nodes, flattenNodes);
    var ptrLinkNodes = linkNodes(flattenNodes, partners);
    check_ptr_links(opts, ptrLinkNodes); // check for crossing of partner lines

    var node = ped.selectAll(".node").data(nodes.descendants()).enter().append("g").attr("transform", function (d, _i) {
      return "translate(" + d.x + "," + d.y + ")";
    }); // provide a border to the node

    node.filter(function (d) {
      return !d.data.hidden;
    }).append("path").attr("shape-rendering", "geometricPrecision").attr("transform", function (d) {
      return d.data.sex == "U" && !(d.data.miscarriage || d.data.termination) ? "rotate(45)" : "";
    }).attr("d", d3.symbol().size(function (_d) {
      return opts.symbol_size * opts.symbol_size + 2;
    }).type(function (d) {
      if (d.data.miscarriage || d.data.termination) return d3.symbolTriangle;
      return d.data.sex == "F" ? d3.symbolCircle : d3.symbolSquare;
    })).style("stroke", function (d) {
      return d.data.age && d.data.yob && !d.data.exclude ? "#303030" : "grey";
    }).style("stroke-width", function (d) {
      return d.data.age && d.data.yob && !d.data.exclude ? ".3em" : ".1em";
    }).style("stroke-dasharray", function (d) {
      return !d.data.exclude ? null : "3, 3";
    }).style("fill", "none"); // set a clippath

    node.filter(function (d) {
      return !(d.data.hidden && !opts.DEBUG);
    }).append("clipPath").attr("id", function (d) {
      return d.data.name;
    }).append("path").attr("class", "node").attr("transform", function (d) {
      return d.data.sex == "U" && !(d.data.miscarriage || d.data.termination) ? "rotate(45)" : "";
    }).attr("d", d3.symbol().size(function (d) {
      if (d.data.hidden) return opts.symbol_size * opts.symbol_size / 5;
      return opts.symbol_size * opts.symbol_size;
    }).type(function (d) {
      if (d.data.miscarriage || d.data.termination) return d3.symbolTriangle;
      return d.data.sex == "F" ? d3.symbolCircle : d3.symbolSquare;
    })); // pie plots for disease colours

    var pienode = node.filter(function (d) {
      return !(d.data.hidden && !opts.DEBUG);
    }).selectAll("pienode").data(function (d) {
      // set the disease data for the pie plot
      var ncancers = 0;
      var cancers = $.map(opts.diseases, function (_val, i) {
        if (prefixInObj(opts.diseases[i].type, d.data)) {
          ncancers++;
          return 1;
        } else return 0;
      });
      if (ncancers === 0) cancers = [1];
      return [$.map(cancers, function (val, _i) {
        return {
          'cancer': val,
          'ncancers': ncancers,
          'id': d.data.name,
          'sex': d.data.sex,
          'proband': d.data.proband,
          'hidden': d.data.hidden,
          'affected': d.data.affected,
          'exclude': d.data.exclude
        };
      })];
    }).enter().append("g");
    pienode.selectAll("path").data(d3.pie().value(function (d) {
      return d.cancer;
    })).enter().append("path").attr("clip-path", function (d) {
      return "url(#" + d.data.id + ")";
    }) // clip the rectangle
    .attr("class", "pienode").attr("d", d3.arc().innerRadius(0).outerRadius(opts.symbol_size)).style("fill", function (d, i) {
      if (d.data.exclude) return 'lightgrey';

      if (d.data.ncancers === 0) {
        if (d.data.affected) return 'darkgrey';
        return opts.node_background;
      }

      return opts.diseases[i].colour;
    }); // adopted in/out brackets

    node.filter(function (d) {
      return !d.data.hidden && (d.data.adopted_in || d.data.adopted_out);
    }).append("path").attr("d", function (_d) {
      {
        var dx = -(opts.symbol_size * 0.66);
        var dy = -(opts.symbol_size * 0.64);
        var indent = opts.symbol_size / 4;
        return get_bracket(dx, dy, indent, opts) + get_bracket(-dx, dy, -indent, opts);
      }
    }).style("stroke", function (d) {
      return d.data.age && d.data.yob && !d.data.exclude ? "#303030" : "grey";
    }).style("stroke-width", function (_d) {
      return ".1em";
    }).style("stroke-dasharray", function (d) {
      return !d.data.exclude ? null : "3, 3";
    }).style("fill", "none"); // alive status = 0; dead status = 1

    node.filter(function (d) {
      return d.data.status == 1;
    }).append('line').style("stroke", "black").attr("x1", function (_d, _i) {
      return -0.6 * opts.symbol_size;
    }).attr("y1", function (_d, _i) {
      return 0.6 * opts.symbol_size;
    }).attr("x2", function (_d, _i) {
      return 0.6 * opts.symbol_size;
    }).attr("y2", function (_d, _i) {
      return -0.6 * opts.symbol_size;
    });
    /*
     * let warn = node.filter(function (d) { return (!d.data.age || !d.data.yob) && !d.data.hidden; }).append("text") .attr('font-family', 'FontAwesome')
     * .attr("x", ".25em") .attr("y", -(0.4 * opts.symbol_size), -(0.2 * opts.symbol_size)) .html("\uf071"); warn.append("svg:title").text("incomplete");
     */
    // add display names and labels defined by opts.labels

    addLabels(opts, node); //

    addWidgets(opts, node); // links between partners

    var clash_depth = {}; // get path looping over node(s)

    var draw_path = function draw_path(clash, dx, dy1, dy2, parent_node, cshift) {
      var extend = function extend(i, l) {
        if (i + 1 < l) // && Math.abs(clash[i] - clash[i+1]) < (opts.symbol_size*1.25)
          return extend(++i);
        return i;
      };

      var path = "";

      for (var j = 0; j < clash.length; j++) {
        var k = extend(j, clash.length);
        var dx1 = clash[j] - dx - cshift;
        var dx2 = clash[k] + dx + cshift;
        if (parent_node.x > dx1 && parent_node.x < dx2) parent_node.y = dy2;
        path += "L" + dx1 + "," + (dy1 - cshift) + "L" + dx1 + "," + (dy2 - cshift) + "L" + dx2 + "," + (dy2 - cshift) + "L" + dx2 + "," + (dy1 - cshift);
        j = k;
      }

      return path;
    };

    partners = ped.selectAll(".partner").data(ptrLinkNodes).enter().insert("path", "g").attr("fill", "none").attr("stroke", "#000").attr("shape-rendering", "auto").attr('d', function (d, _i) {
      var node1 = getNodeByName(flattenNodes, d.mother.data.name);
      var node2 = getNodeByName(flattenNodes, d.father.data.name);
      var consanguity$1 = consanguity(node1, node2, opts);
      var divorced = d.mother.data.divorced && d.mother.data.divorced === d.father.data.name;
      var x1 = d.mother.x < d.father.x ? d.mother.x : d.father.x;
      var x2 = d.mother.x < d.father.x ? d.father.x : d.mother.x;
      var dy1 = d.mother.y;
      var dy2, dx, parent_node; // identify clashes with other nodes at the same depth

      var clash = check_ptr_link_clashes(opts, d);
      var path = "";

      if (clash) {
        if (d.mother.depth in clash_depth) clash_depth[d.mother.depth] += 4;else clash_depth[d.mother.depth] = 4;
        dy1 -= clash_depth[d.mother.depth];
        dx = clash_depth[d.mother.depth] + opts.symbol_size / 2 + 2;
        var parent_nodes = d.mother.data.parent_node;
        var parent_node_name = parent_nodes[0];

        for (var ii = 0; ii < parent_nodes.length; ii++) {
          if (parent_nodes[ii].father.name === d.father.data.name && parent_nodes[ii].mother.name === d.mother.data.name) parent_node_name = parent_nodes[ii].name;
        }

        parent_node = getNodeByName(flattenNodes, parent_node_name);
        parent_node.y = dy1; // adjust hgt of parent node

        clash.sort(function (a, b) {
          return a - b;
        });
        dy2 = dy1 - opts.symbol_size / 2 - 3;
        path = draw_path(clash, dx, dy1, dy2, parent_node, 0);
      }

      var divorce_path = "";
      if (divorced && !clash) divorce_path = "M" + (x1 + (x2 - x1) * .66 + 6) + "," + (dy1 - 6) + "L" + (x1 + (x2 - x1) * .66 - 6) + "," + (dy1 + 6) + "M" + (x1 + (x2 - x1) * .66 + 10) + "," + (dy1 - 6) + "L" + (x1 + (x2 - x1) * .66 - 2) + "," + (dy1 + 6);

      if (consanguity$1) {
        // consanguinous, draw double line between partners
        dy1 = d.mother.x < d.father.x ? d.mother.y : d.father.y;
        dy2 = d.mother.x < d.father.x ? d.father.y : d.mother.y;
        var cshift = 3;

        if (Math.abs(dy1 - dy2) > 0.1) {
          // DIFFERENT LEVEL
          return "M" + x1 + "," + dy1 + "L" + x2 + "," + dy2 + "M" + x1 + "," + (dy1 - cshift) + "L" + x2 + "," + (dy2 - cshift);
        } else {
          // SAME LEVEL
          var path2 = clash ? draw_path(clash, dx, dy1, dy2, parent_node, cshift) : "";
          return "M" + x1 + "," + dy1 + path + "L" + x2 + "," + dy1 + "M" + x1 + "," + (dy1 - cshift) + path2 + "L" + x2 + "," + (dy1 - cshift) + divorce_path;
        }
      }

      return "M" + x1 + "," + dy1 + path + "L" + x2 + "," + dy1 + divorce_path;
    }); // links to children

    ped.selectAll(".link").data(root.links(nodes.descendants())).enter().filter(function (d) {
      // filter unless debug is set
      return opts.DEBUG || d.target.data.noparents === undefined && d.source.parent !== null && !d.target.data.hidden;
    }).insert("path", "g").attr("fill", "none").attr("stroke-width", function (d, _i) {
      if (d.target.data.noparents !== undefined || d.source.parent === null || d.target.data.hidden) return 1;
      return opts.DEBUG ? 2 : 1;
    }).attr("stroke", function (d, _i) {
      if (d.target.data.noparents !== undefined || d.source.parent === null || d.target.data.hidden) return 'pink';
      return "#000";
    }).attr("stroke-dasharray", function (d, _i) {
      if (!d.target.data.adopted_in) return null;
      var dash_len = Math.abs(d.source.y - (d.source.y + d.target.y) / 2);
      var dash_array = [dash_len, 0, Math.abs(d.source.x - d.target.x), 0];
      var twins = getTwins(opts.dataset, d.target.data);
      if (twins.length >= 1) dash_len = dash_len * 3;

      for (var usedlen = 0; usedlen < dash_len; usedlen += 10) {
        $.merge(dash_array, [5, 5]);
      }

      return dash_array;
    }).attr("shape-rendering", function (d, _i) {
      if (d.target.data.mztwin || d.target.data.dztwin) return "geometricPrecision";
      return "auto";
    }).attr("d", function (d, _i) {
      if (d.target.data.mztwin || d.target.data.dztwin) {
        // get twin position
        var twins = getTwins(opts.dataset, d.target.data);

        if (twins.length >= 1) {
          var twinx = 0;
          var xmin = d.target.x;
          d.target.x;

          for (var t = 0; t < twins.length; t++) {
            var thisx = getNodeByName(flattenNodes, twins[t].name).x;
            if (xmin > thisx) xmin = thisx;
            twinx += thisx;
          }

          var xmid = (d.target.x + twinx) / (twins.length + 1);
          var ymid = (d.source.y + d.target.y) / 2;
          var xhbar = "";

          if (xmin === d.target.x && d.target.data.mztwin) {
            // horizontal bar for mztwins
            var xx = (xmid + d.target.x) / 2;
            var yy = (ymid + (d.target.y - opts.symbol_size / 2)) / 2;
            xhbar = "M" + xx + "," + yy + "L" + (xmid + (xmid - xx)) + " " + yy;
          }

          return "M" + d.source.x + "," + d.source.y + "V" + ymid + "H" + xmid + "L" + d.target.x + " " + (d.target.y - opts.symbol_size / 2) + xhbar;
        }
      }

      if (d.source.data.mother) {
        // check parents depth to see if they are at the same level in the tree
        var ma = getNodeByName(flattenNodes, d.source.data.mother.name);
        var pa = getNodeByName(flattenNodes, d.source.data.father.name);

        if (ma.depth !== pa.depth) {
          return "M" + d.source.x + "," + (ma.y + pa.y) / 2 + "H" + d.target.x + "V" + d.target.y;
        }
      }

      return "M" + d.source.x + "," + d.source.y + "V" + (d.source.y + d.target.y) / 2 + "H" + d.target.x + "V" + d.target.y;
    }); // draw proband arrow

    var probandIdx = getProbandIndex(opts.dataset);

    if (typeof probandIdx !== 'undefined') {
      var probandNode = getNodeByName(flattenNodes, opts.dataset[probandIdx].name);
      var triid = "triangle" + makeid(3);
      ped.append("svg:defs").append("svg:marker") // arrow head
      .attr("id", triid).attr("refX", 6).attr("refY", 6).attr("markerWidth", 20).attr("markerHeight", 20).attr("orient", "auto").append("path").attr("d", "M 0 0 12 6 0 12 3 6").style("fill", "black");
      ped.append("line").attr("x1", probandNode.x - opts.symbol_size / 0.7).attr("y1", probandNode.y + opts.symbol_size / 1.4).attr("x2", probandNode.x - opts.symbol_size / 1.4).attr("y2", probandNode.y + opts.symbol_size / 4).attr("stroke-width", 1).attr("stroke", "black").attr("marker-end", "url(#" + triid + ")");
    } // drag and zoom


    init_zoom(opts, svg);
    return opts;
  }

  function create_err(err) {
    console.error(err);
    return new Error(err);
  } // validate pedigree data


  function validate_pedigree(opts) {
    if (opts.validate) {
      if (typeof opts.validate == 'function') {
        if (opts.DEBUG) console.log('CALLING CONFIGURED VALIDATION FUNCTION');
        return opts.validate.call(this, opts);
      } // check consistency of parents sex


      var uniquenames = [];
      var famids = [];
      var display_name;

      for (var p = 0; p < opts.dataset.length; p++) {
        if (!p.hidden) {
          if (opts.dataset[p].mother || opts.dataset[p].father) {
            display_name = opts.dataset[p].display_name;
            if (!display_name) display_name = 'unnamed';
            display_name += ' (IndivID: ' + opts.dataset[p].name + ')';
            var mother = opts.dataset[p].mother;
            var father = opts.dataset[p].father;

            if (!mother || !father) {
              throw create_err('Missing parent for ' + display_name);
            }

            var midx = getIdxByName(opts.dataset, mother);
            var fidx = getIdxByName(opts.dataset, father);
            if (midx === -1) throw create_err('The mother (IndivID: ' + mother + ') of family member ' + display_name + ' is missing from the pedigree.');
            if (fidx === -1) throw create_err('The father (IndivID: ' + father + ') of family member ' + display_name + ' is missing from the pedigree.');
            if (opts.dataset[midx].sex !== "F") throw create_err("The mother of family member " + display_name + " is not specified as female. All mothers in the pedigree must have sex specified as 'F'.");
            if (opts.dataset[fidx].sex !== "M") throw create_err("The father of family member " + display_name + " is not specified as male. All fathers in the pedigree must have sex specified as 'M'.");
          }
        }

        if (!opts.dataset[p].name) throw create_err(display_name + ' has no IndivID.');
        if ($.inArray(opts.dataset[p].name, uniquenames) > -1) throw create_err('IndivID for family member ' + display_name + ' is not unique.');
        uniquenames.push(opts.dataset[p].name);

        if ($.inArray(opts.dataset[p].famid, famids) === -1 && opts.dataset[p].famid) {
          famids.push(opts.dataset[p].famid);
        }
      }

      if (famids.length > 1) {
        throw create_err('More than one family found: ' + famids.join(", ") + '.');
      } // warn if there is a break in the pedigree


      var uc = unconnected(opts.dataset);
      if (uc.length > 0) console.warn("individuals unconnected to pedigree ", uc);
    }
  } //adopted in/out brackets

  function get_bracket(dx, dy, indent, opts) {
    return "M" + (dx + indent) + "," + dy + "L" + dx + " " + dy + "L" + dx + " " + (dy + opts.symbol_size * 1.28) + "L" + dx + " " + (dy + opts.symbol_size * 1.28) + "L" + (dx + indent) + "," + (dy + opts.symbol_size * 1.28);
  } // check for crossing of partner lines


  function check_ptr_links(opts, ptrLinkNodes) {
    for (var a = 0; a < ptrLinkNodes.length; a++) {
      var clash = check_ptr_link_clashes(opts, ptrLinkNodes[a]);
      if (clash) console.log("CLASH :: " + ptrLinkNodes[a].mother.data.name + " " + ptrLinkNodes[a].father.data.name, clash);
    }
  }

  function check_ptr_link_clashes(opts, anode) {
    var root = roots[opts.targetDiv];
    var flattenNodes = flatten(root);
    var mother, father;

    if ('name' in anode) {
      anode = getNodeByName(flattenNodes, anode.name);
      if (!('mother' in anode.data)) return null;
      mother = getNodeByName(flattenNodes, anode.data.mother);
      father = getNodeByName(flattenNodes, anode.data.father);
    } else {
      mother = anode.mother;
      father = anode.father;
    }

    var x1 = mother.x < father.x ? mother.x : father.x;
    var x2 = mother.x < father.x ? father.x : mother.x;
    var dy = mother.y; // identify clashes with other nodes at the same depth

    var clash = $.map(flattenNodes, function (bnode, _i) {
      return !bnode.data.hidden && bnode.data.name !== mother.data.name && bnode.data.name !== father.data.name && bnode.y == dy && bnode.x > x1 && bnode.x < x2 ? bnode.x : null;
    });
    return clash.length > 0 ? clash : null;
  }

  function get_svg_dimensions(opts) {
    return {
      'width': is_fullscreen() ? window.innerWidth : opts.width,
      'height': is_fullscreen() ? window.innerHeight : opts.height
    };
  }

  function get_tree_dimensions(opts) {
    // / get score at each depth used to adjust node separation
    var svg_dimensions = get_svg_dimensions(opts);
    var maxscore = 0;
    var generation = {};

    for (var i = 0; i < opts.dataset.length; i++) {
      var depth = getDepth(opts.dataset, opts.dataset[i].name);
      var children = getAllChildren(opts.dataset, opts.dataset[i]); // score based on no. of children and if parent defined

      var score = 1 + (children.length > 0 ? 0.55 + children.length * 0.25 : 0) + (opts.dataset[i].father ? 0.25 : 0);
      if (depth in generation) generation[depth] += score;else generation[depth] = score;
      if (generation[depth] > maxscore) maxscore = generation[depth];
    }

    var max_depth = Object.keys(generation).length * opts.symbol_size * 3.5;
    var tree_width = svg_dimensions.width - opts.symbol_size > maxscore * opts.symbol_size * 1.65 ? svg_dimensions.width - opts.symbol_size : maxscore * opts.symbol_size * 1.65;
    var tree_height = svg_dimensions.height - opts.symbol_size > max_depth ? svg_dimensions.height - opts.symbol_size : max_depth;
    return {
      'width': tree_width,
      'height': tree_height
    };
  } // group top_level nodes by their partners

  function group_top_level(dataset) {
    // let top_level = $.map(dataset, function(val, i){return 'top_level' in val && val.top_level ? val : null;});
    // calculate top_level nodes
    for (var i = 0; i < dataset.length; i++) {
      if (getDepth(dataset, dataset[i].name) == 2) dataset[i].top_level = true;
    }

    var top_level = [];
    var top_level_seen = [];

    for (var _i2 = 0; _i2 < dataset.length; _i2++) {
      var node = dataset[_i2];

      if ('top_level' in node && $.inArray(node.name, top_level_seen) == -1) {
        top_level_seen.push(node.name);
        top_level.push(node);
        var ptrs = get_partners(dataset, node);

        for (var j = 0; j < ptrs.length; j++) {
          if ($.inArray(ptrs[j], top_level_seen) == -1) {
            top_level_seen.push(ptrs[j]);
            top_level.push(getNodeByName(dataset, ptrs[j]));
          }
        }
      }
    }

    var newdataset = $.map(dataset, function (val, _i) {
      return 'top_level' in val && val.top_level ? null : val;
    });

    for (var _i3 = top_level.length; _i3 > 0; --_i3) {
      newdataset.unshift(top_level[_i3 - 1]);
    }

    return newdataset;
  }

  function rebuild(opts) {
    $("#" + opts.targetDiv).empty();
    init_cache(opts);

    try {
      build(opts);
    } catch (e) {
      console.error(e);
      throw e;
    }

    try {
      templates.update(opts);
    } catch (e) {// templates not declared
    }
  } // add children to a given node

  function addchild(dataset, node, sex, nchild, twin_type) {
    if (twin_type && $.inArray(twin_type, ["mztwin", "dztwin"]) === -1) return new Error("INVALID TWIN TYPE SET: " + twin_type);
    if (_typeof(nchild) === ("undefined" )) nchild = 1;
    var children = getAllChildren(dataset, node);
    var ptr_name, idx;

    if (children.length === 0) {
      var partner = addsibling(dataset, node, node.sex === 'F' ? 'M' : 'F', node.sex === 'F');
      partner.noparents = true;
      ptr_name = partner.name;
      idx = getIdxByName(dataset, node.name) + 1;
    } else {
      var c = children[0];
      ptr_name = c.father === node.name ? c.mother : c.father;
      idx = getIdxByName(dataset, c.name);
    }

    var twin_id;
    if (twin_type) twin_id = getUniqueTwinID(dataset, twin_type);
    var newchildren = [];

    for (var i = 0; i < nchild; i++) {
      var child = {
        "name": makeid(4),
        "sex": sex,
        "mother": node.sex === 'F' ? node.name : ptr_name,
        "father": node.sex === 'F' ? ptr_name : node.name
      };
      dataset.splice(idx, 0, child);
      if (twin_type) child[twin_type] = twin_id;
      newchildren.push(child);
    }

    return newchildren;
  } //

  function addsibling(dataset, node, sex, add_lhs, twin_type) {
    if (twin_type && $.inArray(twin_type, ["mztwin", "dztwin"]) === -1) return new Error("INVALID TWIN TYPE SET: " + twin_type);
    var newbie = {
      "name": makeid(4),
      "sex": sex
    };

    if (node.top_level) {
      newbie.top_level = true;
    } else {
      newbie.mother = node.mother;
      newbie.father = node.father;
    }

    var idx = getIdxByName(dataset, node.name);

    if (twin_type) {
      setMzTwin(dataset, dataset[idx], newbie, twin_type);
    }

    if (add_lhs) {
      // add to LHS
      if (idx > 0) idx--;
    } else idx++;

    dataset.splice(idx, 0, newbie);
    return newbie;
  } // set two siblings as twins

  function setMzTwin(dataset, d1, d2, twin_type) {
    if (!d1[twin_type]) {
      d1[twin_type] = getUniqueTwinID(dataset, twin_type);
      if (!d1[twin_type]) return false;
    }

    d2[twin_type] = d1[twin_type];
    if (d1.yob) d2.yob = d1.yob;
    if (d1.age && (d1.status == 0 || !d1.status)) d2.age = d1.age;
    return true;
  } // get a new unique twins ID, max of 10 twins in a pedigree


  function getUniqueTwinID(dataset, twin_type) {
    var mz = [1, 2, 3, 4, 5, 6, 7, 8, 9, "A"];

    for (var i = 0; i < dataset.length; i++) {
      if (dataset[i][twin_type]) {
        var idx = mz.indexOf(dataset[i][twin_type]);
        if (idx > -1) mz.splice(idx, 1);
      }
    }

    if (mz.length > 0) return mz[0];
    return undefined;
  } // sync attributes of twins


  function syncTwins(dataset, d1) {
    if (!d1.mztwin && !d1.dztwin) return;
    var twin_type = d1.mztwin ? "mztwin" : "dztwin";

    for (var i = 0; i < dataset.length; i++) {
      var d2 = dataset[i];

      if (d2[twin_type] && d1[twin_type] == d2[twin_type] && d2.name !== d1.name) {
        if (twin_type === "mztwin") d2.sex = d1.sex;
        if (d1.yob) d2.yob = d1.yob;
        if (d1.age && (d1.status == 0 || !d1.status)) d2.age = d1.age;
      }
    }
  } // check integrity twin settings

  function checkTwins(dataset) {
    var twin_types = ["mztwin", "dztwin"];

    for (var i = 0; i < dataset.length; i++) {
      for (var j = 0; j < twin_types.length; j++) {
        var twin_type = twin_types[j];

        if (dataset[i][twin_type]) {
          var count = 0;

          for (var _j = 0; _j < dataset.length; _j++) {
            if (dataset[_j][twin_type] == dataset[i][twin_type]) count++;
          }

          if (count < 2) delete dataset[i][[twin_type]];
        }
      }
    }
  } // add parents to the 'node'


  function addparents(opts, dataset, name) {
    var mother, father;
    var root = roots[opts.targetDiv];
    var flat_tree = flatten(root);
    var tree_node = getNodeByName(flat_tree, name);
    var node = tree_node.data;
    var depth = tree_node.depth; // depth of the node in relation to the root (depth = 1 is a top_level node)

    var pid = -101;
    var ptr_name;
    var children = getAllChildren(dataset, node);

    if (children.length > 0) {
      ptr_name = children[0].mother == node.name ? children[0].father : children[0].mother;
      pid = getNodeByName(flat_tree, ptr_name).data.id;
    }

    var i;

    if (depth == 1) {
      mother = {
        "name": makeid(4),
        "sex": "F",
        "top_level": true
      };
      father = {
        "name": makeid(4),
        "sex": "M",
        "top_level": true
      };
      dataset.splice(0, 0, mother);
      dataset.splice(0, 0, father);

      for (i = 0; i < dataset.length; i++) {
        if (dataset[i].top_level && dataset[i].name !== mother.name && dataset[i].name !== father.name) {
          delete dataset[i].top_level;
          dataset[i].noparents = true;
          dataset[i].mother = mother.name;
          dataset[i].father = father.name;
        }
      }
    } else {
      var node_mother = getNodeByName(flat_tree, tree_node.data.mother);
      var node_father = getNodeByName(flat_tree, tree_node.data.father);
      var node_sibs = getAllSiblings(dataset, node); // lhs & rhs id's for siblings of this node

      var rid = 10000;
      var lid = tree_node.data.id;

      for (i = 0; i < node_sibs.length; i++) {
        var sid = getNodeByName(flat_tree, node_sibs[i].name).data.id;
        if (sid < rid && sid > tree_node.data.id) rid = sid;
        if (sid < lid) lid = sid;
      }

      var add_lhs = lid >= tree_node.data.id || pid == lid && rid < 10000;
      if (opts.DEBUG) console.log('lid=' + lid + ' rid=' + rid + ' nid=' + tree_node.data.id + ' ADD_LHS=' + add_lhs);
      var midx;
      if (!add_lhs && node_father.data.id > node_mother.data.id || add_lhs && node_father.data.id < node_mother.data.id) midx = getIdxByName(dataset, node.father);else midx = getIdxByName(dataset, node.mother);
      var parent = dataset[midx];
      father = addsibling(dataset, parent, 'M', add_lhs);
      mother = addsibling(dataset, parent, 'F', add_lhs);
      var faidx = getIdxByName(dataset, father.name);
      var moidx = getIdxByName(dataset, mother.name);

      if (faidx > moidx) {
        // switch to ensure father on lhs of mother
        var tmpfa = dataset[faidx];
        dataset[faidx] = dataset[moidx];
        dataset[moidx] = tmpfa;
      }

      var orphans = getAdoptedSiblings(dataset, node);
      var nid = tree_node.data.id;

      for (i = 0; i < orphans.length; i++) {
        var oid = getNodeByName(flat_tree, orphans[i].name).data.id;
        if (opts.DEBUG) console.log('ORPHAN=' + i + ' ' + orphans[i].name + ' ' + (nid < oid && oid < rid) + ' nid=' + nid + ' oid=' + oid + ' rid=' + rid);

        if ((add_lhs || nid < oid) && oid < rid) {
          var oidx = getIdxByName(dataset, orphans[i].name);
          dataset[oidx].mother = mother.name;
          dataset[oidx].father = father.name;
        }
      }
    }

    if (depth == 2) {
      mother.top_level = true;
      father.top_level = true;
    } else if (depth > 2) {
      mother.noparents = true;
      father.noparents = true;
    }

    var idx = getIdxByName(dataset, node.name);
    dataset[idx].mother = mother.name;
    dataset[idx].father = father.name;
    delete dataset[idx].noparents;

    if ('parent_node' in node) {
      var ptr_node = dataset[getIdxByName(dataset, ptr_name)];

      if ('noparents' in ptr_node) {
        ptr_node.mother = mother.name;
        ptr_node.father = father.name;
      }
    }
  } // add partner

  function addpartner(opts, dataset, name) {
    var root = roots[opts.targetDiv];
    var flat_tree = flatten(root);
    var tree_node = getNodeByName(flat_tree, name);
    var partner = addsibling(dataset, tree_node.data, tree_node.data.sex === 'F' ? 'M' : 'F', tree_node.data.sex === 'F');
    partner.noparents = true;
    var child = {
      "name": makeid(4),
      "sex": "M"
    };
    child.mother = tree_node.data.sex === 'F' ? tree_node.data.name : partner.name;
    child.father = tree_node.data.sex === 'F' ? partner.name : tree_node.data.name;
    var idx = getIdxByName(dataset, tree_node.data.name) + 2;
    dataset.splice(idx, 0, child);
  } // get adjacent nodes at the same depth

  function adjacent_nodes(root, node, excludes) {
    var dnodes = getNodesAtDepth(flatten(root), node.depth, excludes);
    var lhs_node, rhs_node;

    for (var i = 0; i < dnodes.length; i++) {
      if (dnodes[i].x < node.x) lhs_node = dnodes[i];
      if (!rhs_node && dnodes[i].x > node.x) rhs_node = dnodes[i];
    }

    return [lhs_node, rhs_node];
  } // delete a node and descendants


  function delete_node_dataset(dataset, node, opts, onDone) {
    var root = roots[opts.targetDiv];
    var fnodes = flatten(root);
    var deletes = [];
    var i, j; // get d3 data node

    if (node.id === undefined) {
      var d3node = getNodeByName(fnodes, node.name);
      if (d3node !== undefined) node = d3node.data;
    }

    if (node.parent_node) {
      for (i = 0; i < node.parent_node.length; i++) {
        var parent = node.parent_node[i];
        var ps = [getNodeByName(dataset, parent.mother.name), getNodeByName(dataset, parent.father.name)]; // delete parents

        for (j = 0; j < ps.length; j++) {
          if (ps[j].name === node.name || ps[j].noparents !== undefined || ps[j].top_level) {
            dataset.splice(getIdxByName(dataset, ps[j].name), 1);
            deletes.push(ps[j]);
          }
        }

        var children = parent.children;
        var children_names = $.map(children, function (p, _i) {
          return p.name;
        });

        for (j = 0; j < children.length; j++) {
          var child = getNodeByName(dataset, children[j].name);

          if (child) {
            child.noparents = true;
            var ptrs = get_partners(dataset, child);
            var ptr = void 0;
            if (ptrs.length > 0) ptr = getNodeByName(dataset, ptrs[0]);

            if (ptr && ptr.mother !== child.mother) {
              child.mother = ptr.mother;
              child.father = ptr.father;
            } else if (ptr) {
              var child_node = getNodeByName(fnodes, child.name);
              var adj = adjacent_nodes(root, child_node, children_names);
              child.mother = adj[0] ? adj[0].data.mother : adj[1] ? adj[1].data.mother : null;
              child.father = adj[0] ? adj[0].data.father : adj[1] ? adj[1].data.father : null;
            } else {
              dataset.splice(getIdxByName(dataset, child.name), 1);
            }
          }
        }
      }
    } else {
      dataset.splice(getIdxByName(dataset, node.name), 1);
    } // delete ancestors


    console.log(deletes);

    for (i = 0; i < deletes.length; i++) {
      var del = deletes[i];
      var sibs = getAllSiblings(dataset, del);
      console.log('DEL', del.name, sibs);

      if (sibs.length < 1) {
        console.log('del sibs', del.name, sibs);
        var data_node = getNodeByName(fnodes, del.name);
        var ancestors = data_node.ancestors();

        for (j = 0; j < ancestors.length; j++) {
          console.log(ancestors[i]);

          if (ancestors[j].data.mother) {
            console.log('DELETE ', ancestors[j].data.mother, ancestors[j].data.father);
            dataset.splice(getIdxByName(dataset, ancestors[j].data.mother.name), 1);
            dataset.splice(getIdxByName(dataset, ancestors[j].data.father.name), 1);
          }
        }
      }
    } // check integrity of mztwins settings


    checkTwins(dataset);
    var uc;

    try {
      // validate new pedigree dataset
      var newopts = $.extend({}, opts);
      newopts.dataset = copy_dataset(dataset);
      validate_pedigree(newopts); // check if pedigree is split

      uc = unconnected(dataset);
    } catch (err) {
      messages('Warning', 'Deletion of this pedigree member is disallowed.');
      throw err;
    }

    if (uc.length > 0) {
      // check & warn only if this is a new split
      if (unconnected(opts.dataset).length === 0) {
        console.error("individuals unconnected to pedigree ", uc);
        messages("Warning", "Deleting this will split the pedigree. Continue?", onDone, opts, dataset);
        return;
      }
    }

    if (onDone) {
      onDone(opts, dataset);
    }

    return dataset;
  }

  var pedigree = /*#__PURE__*/Object.freeze({
    __proto__: null,
    roots: roots,
    build: build,
    validate_pedigree: validate_pedigree,
    check_ptr_link_clashes: check_ptr_link_clashes,
    get_tree_dimensions: get_tree_dimensions,
    rebuild: rebuild,
    addchild: addchild,
    addsibling: addsibling,
    syncTwins: syncTwins,
    addparents: addparents,
    addpartner: addpartner,
    delete_node_dataset: delete_node_dataset
  });

  exports.canrisk_file = canrisk_file;
  exports.io = io;
  exports.pedcache = pedcache;
  exports.pedigree_form = pedigree_form;
  exports.pedigree_utils = pedigree_utils;
  exports.pedigreejs = pedigree;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

}({}));

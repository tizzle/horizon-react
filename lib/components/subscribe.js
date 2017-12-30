'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports["default"] = subscribe;

var _lodash = require('lodash.isequal');

var _lodash2 = _interopRequireDefault(_lodash);

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _react = require('react');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _requireResolve = require('../utils/requireResolve');

var _requireResolve2 = _interopRequireDefault(_requireResolve);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var emptyArray = [];
var getDisplayName = function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
};

var reduxIsAvailable = function reduxIsAvailable() {
  try {
    (0, _requireResolve2["default"])('redux');
    (0, _requireResolve2["default"])('react-redux');
    return true;
  } catch (e) {} // eslint-disable-line

  return false;
};

/**
 * Subscribes to data specified in mapData
 */
function subscribe() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var mapDataToProps = opts.mapDataToProps;


  delete opts.mapDataToProps;

  return function (TargetComponent) {
    var DataSubscriber = function (_Component) {
      _inherits(DataSubscriber, _Component);

      // make sure react prints parent component name on error/warnings
      function DataSubscriber(props, context) {
        _classCallCheck(this, DataSubscriber);

        var _this = _possibleConstructorReturn(this, (DataSubscriber.__proto__ || Object.getPrototypeOf(DataSubscriber)).call(this, props, context));

        _this.handleData = function (name, docs) {
          var data = docs || emptyArray;

          // always return an array, even if there's just one document
          if ((0, _isPlainObject2["default"])(docs)) {
            data = [docs];
          }

          _this.setState({
            data: _extends({}, _this.state.data, _defineProperty({}, name, data))
          });
        };

        _this.client = props.client || context.horizon;
        _this.store = props.store || context.store;
        _this.subscriptions = {};
        _this.data = {};
        _this.mutations = {};

        _this.useRedux = reduxIsAvailable() && _this.store;

        _this.state = {
          subscribed: false,
          updates: 0,
          data: _this.getDataNames(props),
          storeState: _this.useRedux ? Object.assign({}, _this.store.getState()) : {}
        };
        return _this;
      }

      _createClass(DataSubscriber, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
          this.subscribe(this.props);
        }
      }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
          if (!(0, _lodash2["default"])(nextProps, this.props)) {
            this.subscribe(nextProps);
          }
        }
      }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          // make sure to dispose all subscriptions
          this.unsubscribe(false);
        }
      }, {
        key: 'render',
        value: function render() {
          return (0, _react.createElement)(TargetComponent, _extends({}, this.props, this.state.data, {
            horizon: this.client
          }));
        }
      }, {
        key: 'getDataNames',
        value: function getDataNames(props) {
          if (Array.isArray(mapDataToProps)) {
            return mapDataToProps.reduce(function (acc, s) {
              acc[s.name] = [];return acc;
            }, {});
          } else if ((0, _isPlainObject2["default"])(mapDataToProps)) {
            return this.getObjectWithDataKeys(Object.keys(mapDataToProps));
          } else if (typeof mapDataToProps === 'function') {
            return this.getObjectWithDataKeys(Object.keys(mapDataToProps(props)));
          }
          return null;
        }
      }, {
        key: 'getObjectWithDataKeys',
        value: function getObjectWithDataKeys(keys) {
          return keys.reduce(function (acc, name) {
            acc[name] = [];
            return acc;
          }, {});
        }

        /**
         * Walk through all elements in mapData and set up
         * the subscriptions which should fire setState() every
         * time data changes.
         */

      }, {
        key: 'subscribe',
        value: function subscribe(props) {
          if (Array.isArray(mapDataToProps)) {
            this.subscribeToArray(props);
          } else if ((0, _isPlainObject2["default"])(mapDataToProps)) {
            this.subscribeToObject(props);
          } else if (typeof mapDataToProps === 'function') {
            this.subscribeToFunction(props);
          }

          this.setState({ subscribed: true });
        }

        /**
         * Unsubscribe from all subscriptions.
         */

      }, {
        key: 'unsubscribe',
        value: function unsubscribe() {
          var _this2 = this;

          var updateState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

          Object.keys(this.subscriptions).forEach(function (k) {
            if (_this2.subscriptions[k].subscription.dispose) {
              _this2.subscriptions[k].subscription.dispose();
            }
          });

          if (updateState) {
            this.setState({ subscribed: false });
          }
        }

        /**
         * Query is written as an array.
         *
         * const mapDataToProps = [
         *   { name: 'todos' query: hz => hz('todos').limit(5) }
         *   { name: 'users' query: hz => hz('users').limit(5) }
         * ];
         */

      }, {
        key: 'subscribeToArray',
        value: function subscribeToArray(props) {
          var _this3 = this;

          mapDataToProps.forEach(function (_ref) {
            var query = _ref.query,
                name = _ref.name;

            _this3.handleQuery(query(_this3.client, props), name);
          });
        }

        /**
         * Query is written as an object.
         *
         * Example:
         *
         * const mapDataToProps = {
         *   todos: hz => hz('todos').findAll(...)
         *   users: (hz props) => hz('users').limit(5)
         * };
         */

      }, {
        key: 'subscribeToObject',
        value: function subscribeToObject(props) {
          var _this4 = this;

          Object.keys(mapDataToProps).forEach(function (name) {
            var query = mapDataToProps[name];

            _this4.handleQuery(query(_this4.client, props), name);
          });
        }

        /**
         * Query is written as a function which accepts "props".
         * We execute the function to get back an object with
         * collection and optional query key.
         *
         * Example:
         *
         * const mapDataToProps = (props) => ({
         *   todos: {
         *     collection: 'todos'
         *     query: { name: props.name }
         *   }
         * });
         *
         * @param {String} collection is the name of the collection you want to access
         * @param {Object|String} query is the query object which will be passed to "findAll"
         */

      }, {
        key: 'subscribeToFunction',
        value: function subscribeToFunction(props) {
          var subscribeTo = mapDataToProps(props);

          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = Object.keys(subscribeTo)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var name = _step.value;

              var queryResult = void 0;
              var _subscribeTo$name = subscribeTo[name],
                  collection = _subscribeTo$name.collection,
                  c = _subscribeTo$name.c,
                  query = _subscribeTo$name.query;


              var horizonCollection = this.client(collection || c);

              if (query && Object.keys(query).length) {
                queryResult = horizonCollection.findAll(query);
              } else {
                queryResult = horizonCollection;
              }

              this.handleQuery(queryResult, name);
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator["return"]) {
                _iterator["return"]();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        }

        /**
         * Builds the query and sets up the callback when data
         * changes come in.
         * If the query is the same as the old one we keep the old one
         * and ignore the new one.
         */

      }, {
        key: 'handleQuery',
        value: function handleQuery(query, name) {
          if (this.subscriptions[name]) {
            var prevQuery = this.subscriptions[name].query;

            // if the new query is the same as the previous one,
            // we keep the previous one
            if ((0, _lodash2["default"])(prevQuery, query._query)) return; // eslint-disable-line no-underscore-dangle
          }

          this.subscriptions[name] = {
            subscription: query.watch().forEach(this.handleData.bind(this, name)),
            query: query._query // eslint-disable-line no-underscore-dangle
          };
        }

        /**
         * When new data comes in we update the state of this component
         * this will cause a rerender of it's child component with the new
         * data in props.
         *
         * @TODO this is probably the place where the data should be propagated
         * to the redux store. If other components subscribe with the same query
         * they should find that there's already a query listening and just grab the
         * according data from the app state instead of setting up a separate listener.
         */

      }]);

      return DataSubscriber;
    }(_react.Component);

    DataSubscriber.displayName = 'subscribe(DataSubscriber(' + getDisplayName(TargetComponent) + '))';
    DataSubscriber.contextTypes = {
      horizon: _propTypes2["default"].func,
      store: _propTypes2["default"].object
    };


    if (reduxIsAvailable()) {
      /**
       * Pass options to redux "connect" so there's no need to use
       * two wrappers in application code.
       */
      var mapStateToProps = opts.mapStateToProps,
          mapDispatchToProps = opts.mapDispatchToProps,
          mergeProps = opts.mergeProps,
          options = opts.options;

      var redux = require('react-redux');

      return redux.connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(DataSubscriber);
    }

    return DataSubscriber;
  };
}
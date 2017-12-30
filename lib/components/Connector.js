'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _client = require('@horizon/client');

var _client2 = _interopRequireDefault(_client);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Initializes connection to Horizon server and passes
 * hzConnected prop to enhanced component.
 */
var Connector = function (_Component) {
  _inherits(Connector, _Component);

  function Connector(props, context) {
    _classCallCheck(this, Connector);

    var _this = _possibleConstructorReturn(this, (Connector.__proto__ || Object.getPrototypeOf(Connector)).call(this, props, context));

    _this.onStatus = function (status) {
      _this.setState({
        hzStatus: status
      });
    };

    var initialState = {};

    // the horizon connection
    _this.horizon = props.horizon ? props.horizon : (0, _client2["default"])(props.horizonProps);

    // the redux connection
    _this.store = props.store;

    initialState.hzStatus = props.horizon ? props.horizon.status().getValue() : false;

    _this.state = initialState;
    return _this;
  }

  _createClass(Connector, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        horizon: this.horizon,
        store: this.store
      };
    }
  }, {
    key: 'componentWillMount',
    value: function componentWillMount() {
      // set up connection status callbacks
      this.horizon.onDisconnected(this.onStatus);
      this.horizon.onReady(this.onStatus);
      this.horizon.onSocketError(this.onStatus);

      if (this.props.horizon) return;

      this.horizon.connect(this.onStatus);
    }
  }, {
    key: 'render',
    value: function render() {
      return this.state.hzStatus.type === 'ready' ? this.renderConnected() : this.renderLoading();
    }
  }, {
    key: 'renderConnected',
    value: function renderConnected() {
      return _react.Children.only(this.props.children);
    }
  }, {
    key: 'renderLoading',
    value: function renderLoading() {
      return this.props.loadingComponent ? (0, _react.createElement)(this.props.loadingComponent) : null;
    }
  }]);

  return Connector;
}(_react.Component);

Connector.propTypes = {
  store: _propTypes2["default"].shape({
    subscribe: _propTypes2["default"].func.isRequired,
    dispatch: _propTypes2["default"].func.isRequired,
    getState: _propTypes2["default"].func.isRequired
  }),
  horizonProps: _propTypes2["default"].shape({}),
  horizon: _propTypes2["default"].func,
  children: _propTypes2["default"].element.isRequired
};
Connector.defaultProps = {
  horizonProps: {},
  horizon: undefined,
  store: {
    subscribe: function subscribe() {},
    dispatch: function dispatch() {},
    getState: function getState() {
      return {};
    }
  }
};
Connector.childContextTypes = {
  horizon: _propTypes2["default"].func,
  store: _propTypes2["default"].object
};
exports["default"] = Connector;
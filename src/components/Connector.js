import { Component, createElement, Children } from 'react';
import PropTypes from 'prop-types';
import Horizon from '@horizon/client';

/**
 * Initializes connection to Horizon server and passes
 * hzConnected prop to enhanced component.
 */
export default class Connector extends Component {
  static propTypes = {
    store: PropTypes.shape({
      subscribe: PropTypes.func.isRequired,
      dispatch: PropTypes.func.isRequired,
      getState: PropTypes.func.isRequired
    }),
    horizonProps: PropTypes.shape({}),
    horizon: PropTypes.func,
    children: PropTypes.element.isRequired
  };

  static defaultProps = {
    horizonProps: {},
    horizon: undefined,
    store: {
      subscribe() {},
      dispatch() {},
      getState() { return {}; }
    }
  };

  static childContextTypes = {
    horizon: PropTypes.func,
    store: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);

    const initialState = {};

    // the horizon connection
    this.horizon = props.horizon
      ? props.horizon
      : Horizon(props.horizonProps);

    // the redux connection
    this.store = props.store;

    initialState.hzStatus = props.horizon
      ? props.horizon.status().getValue()
      : false;

    this.state = initialState;
  }

  getChildContext() {
    return {
      horizon: this.horizon,
      store: this.store
    };
  }

  componentWillMount() {
    // set up connection status callbacks
    this.horizon.onDisconnected(this.onStatus);
    this.horizon.onReady(this.onStatus);
    this.horizon.onSocketError(this.onStatus);

    if (this.props.horizon) return;

    this.horizon.connect(this.onStatus);
  }

  onStatus = (status) => {
    this.setState({
      hzStatus: status
    });
  };

  render() {
    return this.state.hzStatus.type === 'ready'
      ? this.renderConnected()
      : this.renderLoading();
  }

  renderConnected() {
    return Children.only(this.props.children);
  }

  renderLoading() {
    return this.props.loadingComponent
      ? createElement(this.props.loadingComponent)
      : null;
  }
}

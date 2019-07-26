/*
 * NovaeZMenuManagerBundle.
 *
 * @package   NovaeZMenuManagerBundle
 *
 * @author    Novactive <f.alexandre@novactive.com>
 * @copyright 2019 Novactive
 * @license   https://github.com/Novactive/NovaeZMenuManagerBundle/blob/master/LICENSE
 *
 */

import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { loadLocationItems } from '../../../../../../ezsystems/ezplatform-admin-ui-modules/src/modules/content-tree/services/content.tree.service'
import $ from 'jquery'
import 'jstree/dist/jstree'

export default class ContentTreeView extends PureComponent {
  constructor (props) {
    super(props)
    this.tree = null
    this.getTreeData = this.getTreeData.bind(this)
    this.handleCheck = this.handleCheck.bind(this)
  }

  getTreeData (node, callback) {
    const parentLocationId = node.id === '#' ? this.props.treeRootLocationId : node.data.locationId
    if (parentLocationId !== undefined) {
      this.loadMoreSubitems({ parentLocationId, offet: 0, limit: 100 }, (location) => {
        if (node.id === '#') {
          callback.call(this, this.generateNodeFromLocation(location, '#'))
        } else {
          callback.call(this, this.generateNodesFromLocationChildren(location))
        }
      })
    }
  }

  generateNodesFromLocationChildren (location) {
    const children = []
    for (const subitem of location.subitems) {
      children.push(this.generateNodeFromLocation(subitem, location.id))
    }

    return children
  }

  generateNodeFromLocation (location, parentId) {
    const hasChildren = location.totalSubitemsCount > 0
    const children = this.generateNodesFromLocationChildren(location)

    return {
      id: location.locationId,
      text: location.name,
      // icon: eZ.helpers.contentType.getContentTypeIconUrl(location.contentTypeIdentifier) || eZ.helpers.contentType.getContentTypeIconUrl('file'),
      state: {
        opened: children.length > 0,
        disabled: false
      },
      type: 'Novactive\\EzMenuManagerBundle\\Entity\\MenuItem\\ContentMenuItem',
      data: {
        position: 0,
        url: `content:${location.contentId}`,
        target: null,
        options: [],
        locationId: location.locationId
      },
      li_attr: {
        title: `(location id: ${location.locationId} | content id: ${location.contentId})`
      },
      children: children.length > 0 ? children : hasChildren
    }
  }

  loadMoreSubitems ({ parentLocationId, offset, limit }, successCallback) {
    loadLocationItems(
      this.props.restInfo,
      parentLocationId,
      successCallback,
      limit,
      offset
    )
  }

  handleCheck (operation, node, parentNode, nodePosition, more) {
    if (operation === 'copy_node') { return false }
    return true
  }

  componentDidMount () {
    this.tree = $(this.treeContainer)
      .jstree({
        core: {
          data: this.getTreeData,
          check_callback: this.handleCheck
        },
        types: this.props.jsTreeTypes,
        dnd: {
          always_copy: true,
          drag_selection: false
        },
        plugins: ['state', 'dnd', 'types']
      })
      .jstree(true)
    $(document)
      .on('dnd_stop.vakata.jstree', this.onDnDStart.bind(this))
  }

  onDnDStart (e, data) {
    if (data.data.origin !== this.tree) {
      return
    }
    const nodes = []
    for (let i = 0, j = data.data.nodes.length; i < j; i++) {
      const node = data.data.origin ? data.data.origin.get_node(data.data.nodes[i]) : data.data.nodes[i]
      node.state.loaded = true
      node.children = []
      node.children_d = []
      node.id = String(
        '_' +
          Math.random()
            .toString(36)
            .substr(2, 9)
      )
      nodes[i] = node
    }
    data.data.nodes = nodes
    data.data.origin = null
  }

  componentDidUpdate () {
    this.tree.settings.core.data = this.getTreeData
    this.tree.refresh({ skip_loading: true })
  }

  render () {
    return <div ref={(div) => (this.treeContainer = div)} />
  }
}

ContentTreeView.propTypes = {
  jsTreeTypes: PropTypes.object,
  treeRootLocationId: PropTypes.number.isRequired,
  restInfo: PropTypes.shape({
    token: PropTypes.string.isRequired,
    siteaccess: PropTypes.string.isRequired
  }).isRequired
}

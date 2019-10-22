import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'next/router';
import { autorun, toJS } from 'mobx';
import { observer, inject } from 'mobx-react';
import { Row, Col, Drawer, Divider, Icon, Button, Tabs } from 'antd';
import { keyPair } from '@waves/ts-lib-crypto';

import ChatCompose from '../chat/compose';
import ChatFocus from '../chat/focus';
import ChatEmpty from '../chat/empty';
import ChatBlank from '../chat/blank';
import ChatIndex from '../chat/index';
import Threads from '../chat/threads';
import Contacts from '../chat/contacts';

// import Menu from './menu';
const { TabPane } = Tabs;

@inject('chat', 'threads', 'contacts', 'cdms', 'app')
@observer
class Main extends React.Component {
  constructor(props) {
    super(props);
    const { chat } = this.props;

    autorun(() => {
      if (props.router.query.publicKey) {
        chat.toRecipients = [props.router.query.publicKey];
        chat.subject = props.router.query.subject || '';
        chat.message = props.router.query.message || '';
        chat.subjectPlaceholder =
          props.router.query.subjectPlaceholder ||
          chat.defaultSubjectPlaceholder;
        chat.messagePlaceholder =
          props.router.query.messagePlaceholder ||
          chat.defaultMessagePlaceholder;
        chat.toggleCompose();
      }
    });
  }

  render() {
    const { threads, chat, contacts, cdms, app } = this.props;
    return (
      <div className="main">
        {chat.composeMode && <ChatCompose />}
        {chat.contactsMode && <Contacts />}
        {!chat.composeMode && chat.focusMode && <ChatFocus />}
        {!chat.composeMode &&
          !chat.focusMode &&
          !chat.contactsMode &&
          threads.list &&
          (threads.list.length === 0 ? (
            <ChatBlank />
          ) : (
            <Row>
              <Col xs={threads.current ? 0 : 24} sm={10} md={8}>
                <Threads />
              </Col>
              <Col xs={threads.current ? 24 : 0} sm={14} md={16}>
                <div
                  style={{
                    height: 'inherit',
                    position: 'relative',
                  }}
                >
                  <Drawer
                    // title="Thread members"
                    placement="top"
                    closable={false}
                    onClose={chat.clearNewMembers}
                    visible={chat.membersDrawerKey !== null}
                    getContainer={false}
                    style={{
                      position: 'absolute',
                    }}
                    height={400}
                  >
                    <Tabs
                      activeKey={chat.membersDrawerKey}
                      tabBarExtraContent={
                        <Button
                          icon="close"
                          shape="circle"
                          onClick={() => {
                            chat.toggleShowMembers(null);
                          }}
                        />
                      }
                      onChange={key => {
                        chat.toggleShowMembers(key);
                      }}
                    >
                      <TabPane
                        tab={
                          <span>
                            <Icon type="plus" />
                            &nbsp;Add member
                          </span>
                        }
                        key="addMember"
                      >
                        <div className="contacts">
                          {contacts.pinned && contacts.pinned.length === 0 && (
                            <div>
                              <p>
                                No pinned contacts.&nbsp;
                                <Button
                                  type="link"
                                  onClick={() => {
                                    chat.toggleContacts();
                                  }}
                                >
                                  Add some
                                </Button>
                              </p>
                            </div>
                          )}
                          {contacts.pinned &&
                            contacts.pinned.map(el => (
                              <div
                                key={`contact_${el.publicKey}`}
                                className="contactRow"
                              >
                                <div className="contact">
                                  {el.contact}&nbsp;
                                  {`<${el.publicKey}>`}
                                </div>
                                <div className="contactSelected">
                                  <Button
                                    shape="circle"
                                    icon={
                                      chat.newMembers.indexOf(el.publicKey) < 0
                                        ? 'plus'
                                        : 'check'
                                    }
                                    type={
                                      chat.newMembers.indexOf(el.publicKey) < 0
                                        ? 'default'
                                        : 'primary'
                                    }
                                    disabled={
                                      (threads.current &&
                                        threads.current.members.indexOf(
                                          el.publicKey,
                                        ) > -1) ||
                                      cdms.sendCdmStatus === 'pending'
                                    }
                                    onClick={() => {
                                      chat.toggleNewMember(el.publicKey);
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                        <Divider />
                        <Button
                          type="primary"
                          disabled={chat.newMembers.length === 0}
                          onClick={() => {
                            cdms.sendAddMembersCdm();
                          }}
                          loading={cdms.sendCdmStatus === 'pending'}
                        >
                          Add members
                        </Button>
                      </TabPane>
                      <TabPane tab="Members" key="members">
                        <div className="members">
                          <p className="member" key="member_you">
                            1. You {`<${keyPair(app.seed).publicKey}>`}
                          </p>
                          {threads.current &&
                            chat.onlineMembers &&
                            threads.current.members.map((el, index) => (
                              <p key={`member_${el}`} className="member">
                                {index + 2}.&nbsp;
                                {chat.onlineMembers.filter(item => item === el)
                                  .length > 0 && (
                                  <span className="online">ONLINE</span>
                                )}
                                {`${contacts.list.filter(
                                  item => item.publicKey === el,
                                ).length > 0 &&
                                  contacts.list.filter(
                                    item => item.publicKey === el,
                                  )[0].contact}
                                  <${el}>`}
                              </p>
                            ))}
                        </div>
                      </TabPane>
                    </Tabs>
                  </Drawer>
                  {threads.current ? <ChatIndex /> : <ChatEmpty />}
                </div>
              </Col>
            </Row>
          ))}
        <style jsx>{`
          .main {
            height: 100vh;
          }

          .menu {
            border-left: 1px solid #ddd;
            height: 100vh;
            padding: 1em 2em;
          }

          .contacts {
            height: 210px;
            overflow-y: auto;
          }

          .members {
            height: 280px;
            overflow-y: auto;
          }

          .member,
          .contact {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .contactRow {
            display: flex;
            padding: 0.2em 0;
          }

          .contactRow:hover {
            background: #fafafa;
          }

          .contact {
            flex: 1;
            line-height: 32px;
          }

          .contactSelected {
            width: 60px;
            height: 32px;
            text-align: right;
            color: #999;
          }

          .online {
            display: inline-block;
            color: #fff;
            background: green;
            padding: 0 0.2em;
            border-radius: 4px;
            margin-right: 4px;
          }
        `}</style>
      </div>
    );
  }
}

Main.propTypes = {
  chat: PropTypes.object,
  threads: PropTypes.object,
  router: PropTypes.object,
  contacts: PropTypes.object,
  cdms: PropTypes.object,
  app: PropTypes.object,
};

export default withRouter(Main);

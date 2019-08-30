import React from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import { Button, Row, Col } from 'antd';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';


@inject('chat')
@observer
class ChatButtons extends React.Component {

    render() {
        const { chat } = this.props;

        return (
            <div>
                <Row>
                    <Col xs={0} sm={24}>
                        <Button
                            type="primary"
                            onClick={chat.sendSponsoredCdm}
                            disabled={chat.message === ''}
                            loading={
                                chat.sendCdmStatus === 'pending' ||
                                (chat.sendCdmStatus !== 'init' && chat.thread === null)
                            }
                        >
                            <FontAwesomeIcon icon={faPaperPlane} />&nbsp;Send
                        </Button>
                    </Col>
                    <Col xs={24} sm={0}>
                        <Button
                            type="primary"
                            shape="circle"
                            onClick={chat.sendSponsoredCdm}
                            disabled={chat.message === ''}
                            loading={
                                chat.sendCdmStatus === 'pending' ||
                                (chat.sendCdmStatus !== 'init' && chat.thread === null)
                            }
                        >
                            <FontAwesomeIcon icon={faPaperPlane} />
                        </Button>
                    </Col>
                </Row>
                <style jsx>{`
                    
                `}</style>
            </div>
        );
    }
}

ChatButtons.propTypes = {
    // index: PropTypes.object,
};

export default ChatButtons;
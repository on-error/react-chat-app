import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  allUsersRoute,
  getUserNotificationsRoute,
  host,
} from '../utils/APIRoutes';
import Contacts from '../components/Contacts';
import Welcome from '../components/Welcome';
import ChatContainer from '../components/ChatContainer';
import { io } from 'socket.io-client';
import { notify } from '../subscription';

const Chat = () => {
  const socket = useRef();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [isLoaded, setIsLoaded] = useState(false);

  const getAllUsers = async () => {
    const data = await axios.get(`${allUsersRoute}/${currentUser._id}`);
    setContacts(data.data);
  };

  const getNotificationData = async () => {
    // console.log('notify here');
    const {
      data: { messages: notificationData },
    } = await axios.get(`${getUserNotificationsRoute}/${currentUser._id}`);

    let title = 'title is here';

    // console.log('notificationData', notificationData);

    if (notificationData.length > 1) {
      title = `You have ${notificationData.length} messages.`;
    } else {
      const sender = contacts.filter((contact) => {
        console.log('comparision', contact._id, notificationData[0]?.sender);
        return contact._id === notificationData[0]?.sender;
      });
      // console.log('senderData', sender);

      title = `${sender[0]?.username} : ${notificationData[0]?.message?.text}`;
    }

    if (notificationData?.length) {
      notify(title);
    }

    setTimeout(getNotificationData, 5000);
  };

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit('add-user', currentUser._id);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!localStorage.getItem('chatAppUser')) {
      navigate('/login');
    } else {
      setCurrentUser(JSON.parse(localStorage.getItem('chatAppUser')));
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.isAvatarImageSet) {
        getAllUsers();
        getNotificationData();
      } else {
        navigate('/setAvatar');
      }
    }
  }, [currentUser]);

  return (
    <Container>
      <div className="container">
        <Contacts
          contacts={contacts}
          currentUser={currentUser}
          changeChat={handleChatChange}
        />
        {isLoaded && currentChat === undefined ? (
          <Welcome currentUser={currentUser} />
        ) : (
          <ChatContainer
            currentChat={currentChat}
            currentUser={currentUser}
            socket={socket}
          />
        )}
      </div>
    </Container>
  );
};

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;

export default Chat;

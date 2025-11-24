import { io } from "socket.io-client";  // Import the socket.io-client
import { apiSlice } from "../../api/apiSlice";

const socket = io("https://s8080.sobhoy.com");  // Connect to your socket server

const getMessage = apiSlice.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        createSingleChat: builder.mutation({
            query: (data) => ({
                url: `/chat`,
                method: "POST",
                body: data,
            }),
        }),
        getChats: builder.query({
            query: () => ({
                url: `/chat`,
                method: "GET",
            }),
            async onCacheEntryAdded(
                arg,
                { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
            ) {
                try {
                    await cacheDataLoaded;
                    const chatEvent = `new-chat`;
                    const handleChat = (chatData) => {
                        const conversation = chatData?.data;
                        console.log("Conversation", conversation);
                        updateCachedData((draft) => {
                            if (!draft?.data?.results) return;
                            const existingChat = draft.data.results.find(
                                (chat) => chat._id === conversation._id
                            );
                            if (existingChat) {
                                existingChat.lastMessage = conversation.lastMessage;
                            } else {
                                draft.data.results.unshift(conversation);
                            }
                        });
                    };
                    socket.on(chatEvent, handleChat);  // Attach the event handler to socket
                    await cacheEntryRemoved;
                    socket.off(chatEvent, handleChat);  // Clean up the event handler when cache is removed
                } catch (error) {
                    console.log(error?.data?.message);
                }
            },
        }),
        getChatQuery: builder.query({
            query: (chatId) => ({
                url: `/chat/${chatId}`,
                method: "GET",
            }),
        }),
        getMessage: builder.query({
            query: (chatId) => ({
                url: `/message/${chatId}`,
                method: "GET",
            }),
            async onCacheEntryAdded(
                arg, // chatId here
                { cacheDataLoaded, cacheEntryRemoved, updateCachedData }
            ) {
                try {
                    await cacheDataLoaded;
                    console.log("Socket Here ", socket);
                    // Dynamically create the messageEvent using chatId
                    const messageEvent = `new-message::${arg}`; // arg is the chatId here

                    const handleNewMessage = (newMessageData) => {
                        console.log(newMessageData);
                        const newMessage = newMessageData?.data;
                        updateCachedData((draft) => {
                            if (!draft?.data?.results) return;
                            draft.data.results.push(newMessage);
                        });
                    };
                    // Listen to the messageEvent using chatId
                    socket.on(messageEvent, handleNewMessage);  // Attach the event handler to socket
                    await cacheEntryRemoved;

                    // Clean up the socket event listener when cacheEntry is removed
                    socket.off(messageEvent, handleNewMessage);  // Clean up the event handler
                } catch (error) {
                    console.log(error?.data?.message);
                }
            },
        }),
        sendMessage: builder.mutation({
            query: (data) => ({
                url: `/message`,
                method: "POST",
                body: data,
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                const messageData = {};
                if (arg instanceof FormData) {
                    arg.forEach((value, key) => (messageData[key] = value));
                } else {
                    Object.assign(messageData, arg);
                }

                try {
                    const { data: responseData } = await queryFulfilled;
                    if (!responseData?.data) {
                        return;
                    }
                    const newMessage = responseData.data;
                    // 🔥 **Update Messages Cache**
                    // dispatch(
                    //     getMessage.util.updateQueryData(
                    //         "getMessage",
                    //         messageData.chatId,
                    //         (draft) => {
                    //             if (!draft?.data?.results) return;
                    //             draft.data?.results.push(newMessage);
                    //         }
                    //     )
                    // );

                    // 🔥 **Update Chats Cache (Last Message)**
                    dispatch(
                        getMessage.util.updateQueryData(
                            "getChats",
                            undefined,
                            (draft) => {
                                if (!draft?.data?.results) return;
                                const chatToUpdate = draft.data?.results.find(
                                    (chat) => chat._id === messageData.chatId
                                );
                                if (chatToUpdate) {
                                    chatToUpdate.lastMessage = newMessage;
                                    chatToUpdate.updatedAt = newMessage?.createdAt;

                                    // 🔥 **Ensure React detects the change**
                                    draft.data.results = [
                                        ...draft.data.results,
                                    ];
                                }
                            }
                        )
                    );
                } catch (error) {
                    console.log(error);
                }
            },
        }),
        getSellKgById: builder.query({
            query: (id) => ({
                url: `/sell-kg/read/${id}`,
                method: "GET",
            }),
        }),
    })
});

export const { useCreateSingleChatMutation, useGetChatsQuery, useGetMessageQuery, useGetChatQueryQuery, useSendMessageMutation, useGetSellKgByIdQuery } = getMessage;

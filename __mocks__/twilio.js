module.exports = jest.fn().mockImplementation(() => ({
    messages: {
        create: jest.fn().mockResolvedValue({ sid: 'mockSid' }),
    },
}));

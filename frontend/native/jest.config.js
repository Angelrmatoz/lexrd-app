module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!.*(react-native|@react-native|expo|@expo|react-navigation|@react-navigation|nativewind|lucide-react-native))"
  ]
};

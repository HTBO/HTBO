// export default defineNuxtPlugin(nuxtApp => {
//     const { connect, disconnect } = useSocketIO();
//     const authStore = useAuthStore();

//     if (authStore.isAuthenticated) {
//         connect();
//     }

//     watch(() => authStore.isAuthenticated, (isAuthenticated) => {
//         if (isAuthenticated) {
//             connect();
//         } else {
//             disconnect();
//         }
//     });

//     nuxtApp.hook('app:beforeMount', () => {
//         if (authStore.isAuthenticated) {
//             connect();
//         }
//     });

//     nuxtApp.hook('app:mounted', () => {
//         window.addEventListener('beforeunload', () => {
//             disconnect();
//         });
//     });
// });
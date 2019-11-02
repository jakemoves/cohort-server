import App from './App.svelte'

const app = new App({
	target: document.body,
	props: {
		Login: 'Login.Svelte'
	}
})

export default app
// imports
const { ethers, run, network } = require("hardhat")

//async main
async function main(){
    const SimpleStorageFactory = await ethers.getContractFactory(  //Достаём контракт SimpleStorage
        "SimpleStorage"
    )
    console.log("Deploying contract...")
    const simpleStorage = await SimpleStorageFactory.deploy()   //Деплоим контракт (инициируем в блокчейне)
    await simpleStorage.deployed() //Возвращает ответ от задеплоиного контракта?
    console.log(`Deployed contract to: ${simpleStorage.address}`)
	if (network.config.chainId === 5 && process.env.ETHERSCAN_API_KEY) {  //Если чейн айди === 5 и подключён доступ ("есть в наличии") етерскан апи ключ
		console.log("Waiting for block confirmations...")
		await simpleStorage.deployTransaction.wait(6)  //ждём 6 секунд для валидации транзакций
		await verify(simpleStorage.address, [])  //Верифицируем
	}

	const currentValue = await simpleStorage.retrieve()
	console.log(`Current value is: ${currentValue}`)

	const transactionResponse = await simpleStorage.store(7)
	await transactionResponse.wait(1)
	const updatedValue = await simpleStorage.retrieve()
	console.log(`Updated value is: ${updatedValue}`)

	console.log("Adding a 'random' person...")
	const person = "Simba"
	const addPerson = await simpleStorage.addPerson(person, updatedValue)
	await addPerson.wait(1)
	console.log(`Person ${person} was tied to a favorite number`)

	const returnNumberForPerson = await simpleStorage.returnFavoriteNumberForName(person)
	console.log(`Favorite number ${person} is ${returnNumberForPerson}`)
}

async function verify(contractAddress, args) {
	console.log("Verifying contract...")
	try {
		await run("verify:verify", {
			address: contractAddress,
			constructorArguments:args,
		})
	} catch (e) {
		if (e.message.toLowerCase().includes("already verified")) {
			console.log("Already Verified!")
		} else {
			console.log(e)
		}
	}
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
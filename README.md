# AlcHackathon
## Fixed income multi decade bonds

This allows any number of users to come togeather and create a 2 sided bond product leveraging alchemix's self repaying loan feature<br />
There are 2 sides to the bond:<br />
    - The stable party gets to receive risk free intrest on their bond<br />
    - The variable party B will provide the intrest that will be payed out and instead take on the risk of the returns being generated not being sufficient to payback the loan that gets taken out to pay the stable party its intrest
    
This allows for the creation of multi decade bonds within the crypto system, for example a bond yielding 2% anually can last for 25 years within this system. If in that time the yield on that product was above 2% then the variable party would make a profit as it would pay back the debt and generate profits for the variable party.

## Testing
```
    npx hardhat compile
    npx hardhat test
```
    

## Example math for the variable portion of the bond
If a bond is to return 50% over its life of 10 years (5% anually, non-compounding), then the total value deposited is (1.5 * principle from stable party), 0.5 coming from the 50% return which is provided by the variable party upfront. Which means that if the overall yield on the vault is actually 6% then the value of the vault (ignoring debt) at the end is:<br />
```
1.5 * (1.06 * 10) = 1.5,
1.5 * 1.6 = 2.4,
2.4 - 0.5 (the debt for the stable vault) = 1.9,
1.9 - 1.5 (the priciple from all parties) = 0.4,
0.4 / 0.5 (principle from the variable party) = 80% return over all for the variable vault
which is 8% anual return none compounding or 5.9% if comounded
```

## Summary
The vairable side can produce negative returns if the vault underperforms the bonds rate, making thise side a leveraged yield farming product<br />
Because the stable side gets the yield upfront from the variable party their returns are guranteed

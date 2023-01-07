import { Pipe, PipeTransform } from '@angular/core';
import { conformToMask } from 'angular2-text-mask';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import 'moment/locale/es';

@Pipe({name: 'MoneyPipe'})
export class MoneyPipe implements PipeTransform {
	// Money convert to Mask '$0.00' or '$12.45' 
	createCurrencyMask(monto: string, prefijo: string, coma: boolean, decimal: boolean): string {
		let isNegative:Boolean=monto.includes("-");
		const decimalsRegex = /\.([0-9]{1,2})/;
		const numberMask = createNumberMask({
			prefix: prefijo,
			includeThousandsSeparator: coma,
			allowDecimal: decimal,
			requireDecimal: decimal,
		});

		let mask = numberMask(monto);
		const result = decimalsRegex.exec(monto);

		if (result && result[1].length < 2) {
			mask.push('0');
		} else if (!result) {
			mask.push('0');
			mask.push('0');
		}

		//Remove '[]' in array to mask
		mask = mask.filter((val) => val != '[]');

		var conformedMoney = conformToMask(
			monto,
			mask,
			{ guide: false }
		)
		return isNegative?conformedMoney.conformedValue.replace("$","-$"):conformedMoney.conformedValue;
	};

	transform(monto: number | string, prefijo?: string, decimal?: boolean): string {
		switch (typeof monto) {
			case 'string':
				monto = this.convertToNumber(monto);
			break;
		}
		return this.createCurrencyMask(monto.toString(), prefijo || '$', true, decimal || true);
	}

	convertToNumber(value: string): number {
		return value ? parseFloat(value.replace(/[^\d\.]/g, "")) : 0;
	}

	// createCurrencyMaskNotSymbol(prefijo:boolean, monto: string, coma: boolean): string {
	// 	const decimalsRegex = /\.([0-9]{1,2})/;
	// 	const numberMask = createNumberMask({
	// 		prefix: '$',
	// 		includeThousandsSeparator: coma,
	// 		allowDecimal: true,
	// 		requireDecimal: true,
	// 	});

	// 	let mask = numberMask(monto);
	// 	const result = decimalsRegex.exec(monto);

	// 	if (result && result[1].length < 2) {
	// 		mask.push('0');
	// 	} else if (!result) {
	// 		mask.push('0');
	// 		mask.push('0');
	// 	}

	// 	//Remove '[]' in array to mask
	// 	mask = mask.filter((val) => val != '[]');

	// 	var conformedMoney = conformToMask(
	// 		monto,
	// 		mask,
	// 		{ guide: false }
	// 	)
	// 	return conformedMoney.conformedValue;
	// };

	// Output Text With Not Symbol $
	transformNotSymbol(monto: number | string): string {
		switch (typeof monto) {
			case 'string':
				monto = this.convertToNumber(monto);
			break;
		}
		return this.createCurrencyMask(monto.toString(), '', false, true);
	}

	// Salida el texto sin prefijo y con coma
	transformarSinPrefijoConComa(monto: number | string): string {
		switch (typeof monto) {
			case 'string':
				monto = this.convertToNumber(monto);
			break;
		}
		return this.createCurrencyMask(monto.toString(), '', true, true);
	}

}
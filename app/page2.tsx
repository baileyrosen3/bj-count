"use client";

import { useState } from "react";
import { styles } from "./styles";
import { useCardCounting } from "./context/CardCountingContext";

interface SelectFieldProps {
  label: string;
  value: number | string;
  onChange: (value: any) => void;
  options: Array<{ value: number | string; label: string }>;
}

const SelectField = ({ label, value, onChange, options }: SelectFieldProps) => (
  <div className="flex items-center justify-between">
    <label className={styles.label}>{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={styles.select}
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="bg-gray-900 text-gray-200"
        >
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

interface StatDisplayProps {
  label: string;
  value: string | number;
}

const StatDisplay = ({ label, value }: StatDisplayProps) => (
  <div>
    <div className="text-sm text-gray-600">{label}</div>
    <div className="font-medium">{value}</div>
  </div>
);

const RulesCard = () => {
  const {
    decks,
    players,
    rules,
    updateDecks,
    updatePlayers,
    updateRules,
    getTrueCount,
    getWinLoss,
  } = useCardCounting();

  const deckOptions = [1, 2, 3, 4, 6, 8].map((num) => ({
    value: num,
    label: num.toString(),
  }));

  const playerOptions = [1, 2, 3, 4, 5, 6, 7].map((num) => ({
    value: num,
    label: num.toString(),
  }));

  const ruleOptions = [
    { value: "H17 DAS", label: "H17 DAS" },
    { value: "S17 DAS", label: "S17 DAS" },
    { value: "H17", label: "H17" },
    { value: "S17", label: "S17" },
  ];

  const trueCount = getTrueCount();
  const winLoss = getWinLoss();

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 shadow-lg h-full">
      <h2 className="text-gray-200 text-sm font-medium mb-4">Rules</h2>

      <div className="space-y-3">
        <SelectField
          label="Decks"
          value={decks}
          onChange={(value) => updateDecks(Number(value))}
          options={deckOptions}
        />

        <SelectField
          label="Players"
          value={players}
          onChange={(value) => updatePlayers(Number(value))}
          options={playerOptions}
        />

        <SelectField
          label="Rules"
          value={rules}
          onChange={updateRules}
          options={ruleOptions}
        />

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex space-x-4">
            <StatDisplay label="True Count" value={trueCount} />
            <StatDisplay label="Win/Loss" value={`${winLoss}%`} />
            <StatDisplay label="Cards" value={decks * 52} />
          </div>
        </div>
      </div>
    </div>
  );
};

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
}

const NumberInput = ({
  label,
  value,
  onChange,
  step = 1,
}: NumberInputProps) => (
  <div className="flex items-center justify-between">
    <label className={styles.label}>{label}</label>
    <div className="flex items-center">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={styles.input}
      />
      <div className="flex flex-col ml-1">
        <button
          onClick={() => onChange(value + step)}
          className={styles.button}
        >
          ▲
        </button>
        <button
          onClick={() => onChange(value - step)}
          className={styles.button}
        >
          ▼
        </button>
      </div>
    </div>
  </div>
);

const BettingCard = () => {
  const [estimationTechniques, setEstimationTechniques] = useState(false);
  const [roundsPerHour, setRoundsPerHour] = useState(120);
  const [spread, setSpread] = useState(10);

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 shadow-lg h-full">
      <h2 className="text-gray-200 text-sm font-medium mb-4">Betting</h2>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="font-medium">Estimation techniques</label>
          <input
            type="checkbox"
            checked={estimationTechniques}
            onChange={(e) => setEstimationTechniques(e.target.checked)}
            className="h-4 w-4"
          />
        </div>

        <NumberInput
          label="Rounds/Hour"
          value={roundsPerHour}
          onChange={setRoundsPerHour}
          step={5}
        />

        <NumberInput label="Spread" value={spread} onChange={setSpread} />

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center">
            <span className="font-medium">Backcounting:</span>
            <span className="ml-2">100% played</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const BankrollRiskCard = () => {
  const [bankroll, setBankroll] = useState<number>(10000);
  const [tripBankroll, setTripBankroll] = useState<number>(1000);
  const [hours, setHours] = useState<number>(10);

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 shadow-lg h-full">
      <h2 className="text-gray-200 text-sm font-medium mb-4">Bankroll/Risk</h2>

      <div className="space-y-3">
        <NumberInput
          label="Bankroll ($)"
          value={bankroll}
          onChange={setBankroll}
          step={1000}
        />

        <NumberInput
          label="Trip Bankroll"
          value={tripBankroll}
          onChange={setTripBankroll}
          step={100}
        />

        <NumberInput label="Hours" value={hours} onChange={setHours} />
      </div>
    </div>
  );
};

const SimplifyCard = () => {
  const [minChipSize, setMinChipSize] = useState<number>(5);
  const [minimumBet, setMinimumBet] = useState<number>(15);
  const [manuallyAdjustMinBet, setManuallyAdjustMinBet] =
    useState<boolean>(true);
  const [freezeCustomBets, setFreezeCustomBets] = useState<boolean>(true);

  const chipSizeOptions = [
    { value: "Minimum Chip Size", label: "Minimum Chip Size" },
    { value: "Custom Size", label: "Custom Size" },
  ];

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 shadow-lg h-full">
      <h2 className="text-gray-200 text-sm font-medium mb-4">Simplify</h2>

      <div className="space-y-3">
        <SelectField
          label=""
          value="Minimum Chip Size"
          onChange={() => {}}
          options={chipSizeOptions}
        />

        <NumberInput
          label="Min. Chip Size"
          value={minChipSize}
          onChange={setMinChipSize}
        />

        <NumberInput
          label="Minimum Bet ($)"
          value={minimumBet}
          onChange={setMinimumBet}
        />

        <div className="flex items-center justify-between">
          <label className="font-medium">Manually Adjust Min Bet</label>
          <input
            type="checkbox"
            checked={manuallyAdjustMinBet}
            onChange={(e) => setManuallyAdjustMinBet(e.target.checked)}
            className="h-4 w-4"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="font-medium">Freeze Custom Bets</label>
          <input
            type="checkbox"
            checked={freezeCustomBets}
            onChange={(e) => setFreezeCustomBets(e.target.checked)}
            className="h-4 w-4"
          />
        </div>
      </div>
    </div>
  );
};

interface CountingTableRow {
  count: number;
  countFreq: string;
  winLoss: string;
  standardDeviation: string;
  exactBet: string;
  chipsBet: string;
  customBet: string;
}

const CountingTableCard = () => {
  const tableData: CountingTableRow[] = [
    {
      count: -3,
      countFreq: "9.33%",
      winLoss: "-3.17%",
      standardDeviation: "1.178",
      exactBet: "1.00",
      chipsBet: "",
      customBet: "0",
    },
    {
      count: -2,
      countFreq: "8.84%",
      winLoss: "-1.89%",
      standardDeviation: "1.158",
      exactBet: "1.00",
      chipsBet: "",
      customBet: "0",
    },
    {
      count: -1,
      countFreq: "16.02%",
      winLoss: "-1.21%",
      standardDeviation: "1.163",
      exactBet: "1.00",
      chipsBet: "",
      customBet: "0",
    },
    {
      count: 0,
      countFreq: "28.37%",
      winLoss: "-0.78%",
      standardDeviation: "1.161",
      exactBet: "1.00",
      chipsBet: "15",
      customBet: "0",
    },
    {
      count: 1,
      countFreq: "16.42%",
      winLoss: "-0.07%",
      standardDeviation: "1.157",
      exactBet: "1.00",
      chipsBet: "",
      customBet: "15",
    },
    {
      count: 2,
      countFreq: "9.11%",
      winLoss: "0.50%",
      standardDeviation: "1.154",
      exactBet: "5.47",
      chipsBet: "80",
      customBet: "25",
    },
    {
      count: 3,
      countFreq: "5.18%",
      winLoss: "1.06%",
      standardDeviation: "1.155",
      exactBet: "10.00",
      chipsBet: "",
      customBet: "50",
    },
    {
      count: 4,
      countFreq: "2.97%",
      winLoss: "1.46%",
      standardDeviation: "1.162",
      exactBet: "10.00",
      chipsBet: "",
      customBet: "75",
    },
    {
      count: 5,
      countFreq: "1.68%",
      winLoss: "2.14%",
      standardDeviation: "1.172",
      exactBet: "10.00",
      chipsBet: "",
      customBet: "100",
    },
    {
      count: 6,
      countFreq: "0.95%",
      winLoss: "2.01%",
      standardDeviation: "1.179",
      exactBet: "10.00",
      chipsBet: "",
      customBet: "125",
    },
    {
      count: 7,
      countFreq: "0.52%",
      winLoss: "3.65%",
      standardDeviation: "1.180",
      exactBet: "10.00",
      chipsBet: "",
      customBet: "150",
    },
    {
      count: 8,
      countFreq: "0.28%",
      winLoss: "4.37%",
      standardDeviation: "1.179",
      exactBet: "10.00",
      chipsBet: "",
      customBet: "150",
    },
    {
      count: 9,
      countFreq: "0.14%",
      winLoss: "5.14%",
      standardDeviation: "1.174",
      exactBet: "10.00",
      chipsBet: "150",
      customBet: "150",
    },
    {
      count: 10,
      countFreq: "0.07%",
      winLoss: "5.29%",
      standardDeviation: "1.171",
      exactBet: "10.00",
      chipsBet: "",
      customBet: "150",
    },
  ];

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 shadow-lg h-full">
      <h2 className="text-gray-200 text-sm font-medium mb-4">
        Counting Statistics
      </h2>

      <table className="min-w-full text-xs">
        <thead>
          <tr className={styles.countingTable.header}>
            <th className={styles.countingTable.cell}>Count</th>
            <th className={styles.countingTable.cell}>Count Freq</th>
            <th className={styles.countingTable.cell}>Win/Loss</th>
            <th className={styles.countingTable.cell}>Standard Deviation</th>
            <th className={styles.countingTable.cell}>Exact Bet</th>
            <th className={styles.countingTable.cell}>Chips</th>
            <th className={styles.countingTable.cell}>Custom Bets</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, index) => (
            <tr
              key={row.count}
              className={`${styles.countingTable.row} 
                ${
                  parseFloat(row.winLoss) < 0
                    ? styles.countingTable.negativeValue
                    : ""
                }
                ${
                  parseFloat(row.winLoss) > 0
                    ? styles.countingTable.positiveValue
                    : ""
                }`}
            >
              <td className={styles.countingTable.cell}>{row.count}</td>
              <td className={styles.countingTable.cell}>{row.countFreq}</td>
              <td className={styles.countingTable.cell}>{row.winLoss}</td>
              <td className={styles.countingTable.cell}>
                {row.standardDeviation}
              </td>
              <td className={styles.countingTable.cell}>{row.exactBet}</td>
              <td className={styles.countingTable.cell}>{row.chipsBet}</td>
              <td className={styles.countingTable.cell}>{row.customBet}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const PenetrationChart = () => {
  const [selectedScore, setSelectedScore] = useState<string>("SCORE");

  const scoreOptions = [
    { value: "SCORE", label: "SCORE" },
    { value: "OTHER", label: "OTHER" },
  ];

  // Generate points for the curve
  const generateCurvePoints = () => {
    const points: [number, number][] = [];
    for (let x = 0; x <= 100; x++) {
      // Exponential curve formula
      const y = Math.min((50 * Math.exp(x / 50)) / Math.exp(2), 50);
      points.push([x, y]);
    }
    return points;
  };

  const points = generateCurvePoints();
  const maxY = 60;

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 shadow-lg h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-gray-200 text-sm font-medium">
          Penetration Charts
        </h2>
        <div className="flex items-center space-x-2">
          <select
            value={selectedScore}
            onChange={(e) => setSelectedScore(e.target.value)}
            className="border rounded px-2 py-1"
          >
            {scoreOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button className="text-blue-500 hover:text-blue-700">?</button>
        </div>
      </div>

      <div className="relative h-[300px] w-full">
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Y-axis labels */}
          {[0, 10, 20, 30, 40, 50, 60].map((value) => (
            <g key={value}>
              <text
                x="30"
                y={280 - (value * 280) / maxY}
                className="text-xs"
                textAnchor="end"
              >
                {value}
              </text>
              <line
                x1="35"
                y1={280 - (value * 280) / maxY}
                x2="380"
                y2={280 - (value * 280) / maxY}
                stroke="#ddd"
                strokeWidth="0.5"
              />
            </g>
          ))}

          {/* X-axis labels */}
          {[130, 120, 110, 100, 90, 80, 70, 60, 50, 40, 30].map(
            (value, index) => (
              <text
                key={value}
                x={35 + (index * 345) / 10}
                y="295"
                className="text-xs"
                textAnchor="middle"
              >
                {value}
              </text>
            )
          )}

          {/* Red area */}
          <path
            d={`M 35,280 
                ${points
                  .map(
                    ([x, y], i) =>
                      `L ${35 + (x * 345) / 100},${280 - (y * 280) / maxY}`
                  )
                  .join(" ")}
                L 380,280 Z`}
            fill="rgba(239, 68, 68, 0.3)"
            stroke="rgb(239, 68, 68)"
          />

          {/* Blue vertical line at specific position */}
          <line
            x1="200"
            y1="20"
            x2="200"
            y2="280"
            stroke="blue"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
};

const ActualResultsCard = () => {
  const [actualResult, setActualResult] = useState<number>(1);
  const expected = 250;
  const standardDev = -0.2;
  const probability = 57.91;

  // Function to generate bell curve points
  const generateBellCurve = () => {
    const points: [number, number][] = [];
    for (let x = -4; x <= 4; x += 0.1) {
      const y = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-(x * x) / 2);
      points.push([x, y]);
    }
    return points;
  };

  const bellCurvePoints = generateBellCurve();

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 shadow-lg h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-gray-200 text-sm font-medium">Actual Results</h2>
        <button className="text-blue-500 hover:text-blue-700">?</button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left side - Results data */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-medium">Actual Result:</label>
            <input
              type="number"
              value={actualResult}
              onChange={(e) => setActualResult(Number(e.target.value))}
              className="border rounded px-2 py-1 w-24 text-right"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="font-medium">Expected:</label>
            <div className="border rounded px-2 py-1 w-24 text-right bg-black">
              ${expected}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="font-medium">Standard Dev:</label>
            <div className="border rounded px-2 py-1 w-24 text-right bg-black">
              {standardDev}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="font-medium text-sm">
              Probability of this result or better:
            </label>
            <div className="border rounded px-2 py-1 w-24 text-right bg-gray-50">
              {probability}%
            </div>
          </div>
        </div>

        {/* Right side - Bell curve chart */}
        <div className="relative h-[150px]">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            {/* Bell curve - split into red and green */}
            <path
              d={`M ${bellCurvePoints
                .filter((p) => p[0] <= 0)
                .map(
                  (p, i) =>
                    `${i === 0 ? "M" : "L"} ${(p[0] + 4) * 12.5},${
                      100 - p[1] * 200
                    }`
                )
                .join(" ")}`}
              fill="none"
              stroke="rgb(239, 68, 68)"
              strokeWidth="2"
            />
            <path
              d={`M ${bellCurvePoints
                .filter((p) => p[0] >= 0)
                .map(
                  (p, i) =>
                    `${i === 0 ? "M" : "L"} ${(p[0] + 4) * 12.5},${
                      100 - p[1] * 200
                    }`
                )
                .join(" ")}`}
              fill="none"
              stroke="rgb(34, 197, 94)"
              strokeWidth="2"
            />

            {/* -3SD and +3SD labels */}
            <text x="5" y="95" className="text-xs">
              -3SD
            </text>
            <text x="85" y="95" className="text-xs">
              +3SD
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
};

const ExpectedResultsCard = () => {
  const win = 250;
  const probabilities = [
    { prob: "66.7%", range: "$-958 to $1,458" },
    { prob: "90%", range: "$-1,802 to $2,302" },
    { prob: "99.7%", range: "$-3,451 to $3,951" },
  ];

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 shadow-lg h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-gray-200 text-sm font-medium">Expected Results</h2>
        <button className="text-blue-500 hover:text-blue-700">?</button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="font-medium">Win:</label>
          <div className="border rounded px-2 py-1 w-24 text-right bg-black">
            ${win}
          </div>
        </div>

        <div className="mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-black text-green-400">
                <th className="px-3 py-2 text-left">Prob</th>
                <th className="px-3 py-2 text-left">Results</th>
              </tr>
            </thead>
            <tbody>
              {probabilities.map((item, index) => (
                <tr key={item.prob} className="bg-black">
                  <td className="px-3 py-2">
                    <select
                      value={item.prob}
                      onChange={() => {}}
                      className="border-none bg-transparent w-full"
                    >
                      <option value={item.prob}>{item.prob}</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">{item.range}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const RiskCard = () => {
  const [goalToWin, setGoalToWin] = useState<number>(500);

  const riskData = [
    { goal: "Infinite", hours: "10", risk: "35.561%" },
    { goal: "Infinite", hours: "Infinite", risk: "72.48%" },
    { goal: "500", hours: "10", risk: "26.63%" },
    { goal: "500", hours: "Infinite", risk: "28.14%" },
  ];

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 shadow-lg h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-gray-200 text-sm font-medium">
          Risk (Trip Ruin is first row)
        </h2>
        <button className="text-blue-500 hover:text-blue-700">?</button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <label className="font-medium">Goal to Win:</label>
          <input
            type="number"
            value={goalToWin}
            onChange={(e) => setGoalToWin(Number(e.target.value))}
            className="border rounded px-2 py-1 w-24 text-right"
          />
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-black">
              <th className="px-3 py-2 text-left text-green-400">Goal</th>
              <th className="px-3 py-2 text-left text-green-400">Hours</th>
              <th className="px-3 py-2 text-left text-green-400">Risk</th>
            </tr>
          </thead>
          <tbody>
            {riskData.map((row, index) => (
              <tr key={index} className="bg-black">
                <td className="px-3 py-2">{row.goal}</td>
                <td className="px-3 py-2">{row.hours}</td>
                <td className="px-3 py-2">{row.risk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const GoalsCard = () => {
  const [goalToWin, setGoalToWin] = useState<number>(500);

  const goalsData = [
    { hours: 5, odds: "61.14%" },
    { hours: 10, odds: "69.94%" },
    { hours: 20, odds: "71.80%" },
    { hours: "INF", odds: "71.86%" },
  ];

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 shadow-lg h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-gray-200 text-sm font-medium">Goals</h2>
        <button className="text-blue-500 hover:text-blue-700">?</button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <label className="font-medium">Goal to Win:</label>
          <input
            type="number"
            value={goalToWin}
            onChange={(e) => setGoalToWin(Number(e.target.value))}
            className="border rounded px-2 py-1 w-24 text-right"
          />
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-black text-green-400">
              <th className="px-3 py-2 text-left">Hours</th>
              <th className="px-3 py-2 text-left">Odds of making Goal</th>
            </tr>
          </thead>
          <tbody>
            {goalsData.map((row, index) => (
              <tr key={index} className="bg-green-100">
                <td className="px-3 py-2">{row.hours}</td>
                <td className="px-3 py-2">{row.odds}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const HoursToGainCard = () => {
  const [hoursPerDay, setHoursPerDay] = useState<number>(8);
  const [expensesPerDay, setExpensesPerDay] = useState<number>(0);

  const gainData = [
    { gain: "50%", hours: 200, days: 25.0 },
    { gain: "100%", hours: 400, days: 50.0 },
    { gain: "200%", hours: 800, days: 100.0 },
  ];

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 shadow-lg h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-gray-200 text-sm font-medium">Hours to Gain</h2>
        <button className="text-blue-500 hover:text-blue-700">?</button>
      </div>

      <div className="space-y-3">
        <NumberInput
          label="Hours/Day"
          value={hoursPerDay}
          onChange={setHoursPerDay}
        />

        <NumberInput
          label="Expenses/Day"
          value={expensesPerDay}
          onChange={setExpensesPerDay}
        />

        <table className="w-full text-sm mt-4">
          <thead>
            <tr className="bg-black text-green-400">
              <th className="px-3 py-2 text-left">Gain</th>
              <th className="px-3 py-2 text-left">Hours</th>
              <th className="px-3 py-2 text-left">Days</th>
            </tr>
          </thead>
          <tbody>
            {gainData.map((row, index) => (
              <tr key={index} className="bg-green-100">
                <td className="px-3 py-2">{row.gain}</td>
                <td className="px-3 py-2">{row.hours}</td>
                <td className="px-3 py-2">{row.days}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ResultsStatsCard = () => {
  const optimalStats = {
    bets: "Optimal",
    avgBet: "$36.92",
    ev: "0.577%",
    winRnd: "$0.21",
    winHour: "$25.57",
    roundStdDev: "$68.02",
    hourStdDev: "$745.08",
    riskOfRuin: "39.8%",
    di: "3.13",
    score: "9.82",
    ce: "($23.12)",
    ceWr: "-0.90",
    n0: "101,863",
    wl: ".010",
    winHourScore: "$0.38",
    scoreStdErr: "0.29",
  };

  const customStats = {
    bets: "Custom",
    avgBet: "$14.04",
    ev: "1.484%",
    winRnd: "$0.21",
    winHour: "$24.99",
    roundStdDev: "$36.00",
    hourStdDev: "$394.35",
    riskOfRuin: "4.0%",
    di: "5.79",
    score: "33.47",
    ce: "$11.35",
    ceWr: "0.45",
    n0: "29,876",
    wl: ".007",
    winHourScore: "$0.11",
    scoreStdErr: "0.28",
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 shadow-lg h-full">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-black text-green-400">
            <th className="px-2 py-1 text-left">Bets</th>
            <th className="px-2 py-1 text-left">Avg Bet</th>
            <th className="px-2 py-1 text-left">EV</th>
            <th className="px-2 py-1 text-left">Win/Rnd</th>
            <th className="px-2 py-1 text-left">Win/Hour</th>
            <th className="px-2 py-1 text-left">Round</th>
            <th className="px-2 py-1 text-left">Hour</th>
            <th className="px-2 py-1 text-left">Risk of Ruin</th>
            <th className="px-2 py-1 text-left">DI</th>
            <th className="px-2 py-1 text-left">SCORE</th>
            <th className="px-2 py-1 text-left">CE</th>
            <th className="px-2 py-1 text-left">CE/WR</th>
            <th className="px-2 py-1 text-left">N0</th>
            <th className="px-2 py-1 text-left">%W/L</th>
            <th className="px-2 py-1 text-left">Win/Hour</th>
            <th className="px-2 py-1 text-left">SCORE</th>
          </tr>
        </thead>
        <tbody>
          {[optimalStats, customStats].map((stats, index) => (
            <tr
              key={index}
              className={index === 0 ? "bg-green-100" : "bg-blue-100"}
            >
              <td className="px-2 py-1">{stats.bets}</td>
              <td className="px-2 py-1">{stats.avgBet}</td>
              <td className="px-2 py-1">{stats.ev}</td>
              <td className="px-2 py-1">{stats.winRnd}</td>
              <td className="px-2 py-1">{stats.winHour}</td>
              <td className="px-2 py-1">{stats.roundStdDev}</td>
              <td className="px-2 py-1">{stats.hourStdDev}</td>
              <td className="px-2 py-1">{stats.riskOfRuin}</td>
              <td className="px-2 py-1">{stats.di}</td>
              <td className="px-2 py-1">{stats.score}</td>
              <td className="px-2 py-1">{stats.ce}</td>
              <td className="px-2 py-1">{stats.ceWr}</td>
              <td className="px-2 py-1">{stats.n0}</td>
              <td className="px-2 py-1">{stats.wl}</td>
              <td className="px-2 py-1">{stats.winHourScore}</td>
              <td className="px-2 py-1">{stats.scoreStdErr}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function Dashboard() {
  return (
    <main className="p-2 bg-gray-950 min-h-screen text-gray-200">
      <div className="grid grid-cols-3 gap-4 h-full">
        {/* Left column */}
        <div className="space-y-4 h-full">
          <div className="grid grid-cols-2 gap-4 h-[30%]">
            <RulesCard />
            <BettingCard />
          </div>
          <div className="h-[68%]">
            <CountingTableCard />
          </div>
        </div>

        {/* Middle column */}
        <div className="space-y-4 h-full">
          <div className="grid grid-cols-2 gap-4 h-[30%]">
            <BankrollRiskCard />
            <SimplifyCard />
          </div>
          <div className="h-[35%]">
            <PenetrationChart />
          </div>
          <div className="h-[33%]">
            <ActualResultsCard />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4 h-full">
          <div className="flex flex-col gap-4 h-full">
            <div className="h-[25%]">
              <ExpectedResultsCard />
            </div>
            <div className="h-[25%]">
              <RiskCard />
            </div>
            <div className="h-[25%]">
              <GoalsCard />
            </div>
            <div className="h-[25%]">
              <HoursToGainCard />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom stats table */}
      <div className="w-full mt-4">
        <ResultsStatsCard />
      </div>
    </main>
  );
}

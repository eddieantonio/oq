<!-- This is the questionnaire for now. Eventually I will refactor this to have its own page. -->
<h1>Questionnaire</h1>

<form method="post">
	<fieldset>
		<legend>Part 1: Programming experience</legend>

		<div class="input-group">
			<label for="experience">How many years have you been programming?</label>
			<input type="number" id="experience" name="experience" min="0" max="100" step="1" value="0" />
		</div>

		<div class="input-group">
			<label for="python-experience">How many years have you been programming in Python?</label>
			<input
				type="number"
				id="python-experience"
				name="python-experience"
				min="0"
				max="100"
				step="1"
				value="0"
			/>
		</div>

		<!-- we'll come up with better widgets for likert scales later -->
		<div class="input-group">
			<label for="experience-likert"
				>How would you rate your overall experience with programming? (1=complete beginner,
				7=expert)</label
			>
			<input
				type="number"
				id="experience-likert"
				name="experience-likert"
				min="1"
				max="7"
				step="1"
				value="1"
			/>
		</div>

		<div class="input-group">
			<label for="python-familiarity-likert"
				>How would you rate your overall familiarity with Python? (1=complete beginner, 7=expert)</label
			>
			<input
				type="number"
				id="python-familiarity-likert"
				name="python-familiarity-likert"
				min="1"
				max="7"
				step="1"
				value="1"
			/>
		</div>

		<div class="input-group">
			<label for="best-language">What programming language are you most experienced in?</label>
			<input type="text" id="best-language" name="best-language" value="" />
		</div>

		<div class="input-group">
			<label for="favourite-ide">What is your favourite code editor or IDE?</label>
			<input type="text" id="favourite-ide" name="favourite-ide" value="" />
		</div>
	</fieldset>

	<button type="submit">Submit</button>
</form>

<p>
	<small>
		(<a href="/answers">See the answers</a>)
	</small>
</p>
